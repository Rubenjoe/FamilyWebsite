#!/usr/bin/env node
/**
 * Permission matrix check.
 *
 * The admin area gates access in four places that must agree:
 *   1. utils/admin.ts            — the flags and how each role maps to them
 *   2. app/admin/(…) /page.tsx   — the server-side guard per destination
 *   3. AdminShell.tsx            — which nav links a role can see
 *   4. AdminDashboardClient.tsx  — which quick-link cards a role can see
 *
 * Drift between them is silent and confusing: a role either sees a link that
 * bounces it to /dashboard, or holds a permission with no way to reach the page.
 * Nothing in the build catches that, and there is no test framework here, so
 * this script reads the four sources and compares them.
 *
 * Usage: npm run check:permissions
 * Exit code 1 means the matrix is inconsistent.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ADMIN_UTIL = "utils/admin.ts";
const SHELL = "src/components/admin/AdminShell.tsx";
const DASHBOARD = "src/components/admin/AdminDashboardClient.tsx";
const ADMIN_PAGES = "app/admin";
const ADMIN_API = "app/api/admin";

const errors = [];
const warnings = [];

const read = (relative) => readFile(path.join(ROOT, relative), "utf8");

function evaluate(expression, env) {
  // Expressions here are only `a`, `a === "value"`, joined by || and &&.
  return expression
    .split("||")
    .some((clause) =>
      clause.split("&&").every((rawToken) => {
        const token = rawToken.trim();
        if (token === "true") return true;
        if (token === "false") return false;

        const equality = token.match(/^(\w+)\s*===\s*["']([^"']+)["']$/);
        if (equality) return env[equality[1]] === equality[2];

        return Boolean(env[token]);
      })
    );
}

async function loadFlags() {
  const source = await read(ADMIN_UTIL);

  // Role primitives, in declaration order (later ones use earlier ones).
  const primitives = [...source.matchAll(/const (is\w+) = (.+?);/g)].map(
    ([, name, expression]) => ({ name, expression })
  );

  // Flags returned by getAdminSession.
  const returnBlock = source.slice(source.indexOf("return {"));
  const flags = [...returnBlock.matchAll(/^\s*(can\w+):\s*(.+?),?$/gm)].map(
    ([, name, expression]) => ({ name, expression: expression.replace(/,$/, "") })
  );

  if (flags.length === 0) {
    errors.push(`${ADMIN_UTIL}: could not find any can* flags in getAdminSession().`);
  }

  const sessionFor = (role) => {
    const env = {};
    for (const primitive of primitives) {
      env[primitive.name] = evaluate(primitive.expression, { ...env, role });
    }
    const result = {};
    for (const flag of flags) {
      result[flag.name] = evaluate(flag.expression, env);
    }
    return result;
  };

  const roles = [...source.matchAll(/role === "(\w+)"/g)].map(([, role]) => role);
  const uniqueRoles = [...new Set(roles)].sort();

  return { flags, primitives, roles: uniqueRoles, sessionFor };
}

async function loadPageGuards() {
  const entries = await readdir(path.join(ROOT, ADMIN_PAGES), { withFileTypes: true });
  const routes = new Map();

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const route = `/admin/${entry.name}`;
    const file = `${ADMIN_PAGES}/${entry.name}/page.tsx`;
    let source;
    try {
      source = await read(file);
    } catch {
      continue; // Not every folder must hold a page.
    }

    const guard = source.match(/if \(!session(?:\s*\|\|\s*!session\.(can\w+))?\)/);
    const flag = guard?.[1] ?? null;

    if (source.includes("/dashboard?error=unauthorized") === false) {
      errors.push(`${file}: does not redirect unauthorized roles to /dashboard?error=unauthorized.`);
    }

    routes.set(route, { flag, file });
  }

  // The overview lives at app/admin/page.tsx, not in a sub-folder, and needs no
  // permission beyond being an admin at all.
  try {
    await read(`${ADMIN_PAGES}/page.tsx`);
    routes.set("/admin", { flag: null, file: `${ADMIN_PAGES}/page.tsx` });
  } catch {
    warnings.push(`${ADMIN_PAGES}/page.tsx: overview page not found.`);
  }

  return routes;
}

async function loadShellNav() {
  const source = await read(SHELL);
  const nav = new Map();

  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/\{\s*href:\s*"(\/admin[^"]*)",[^}]*visible:\s*([^,}]+)/);
    if (!match) continue;
    nav.set(match[1], match[2].trim());
  }

  if (nav.size === 0) errors.push(`${SHELL}: could not read any nav items.`);
  return nav;
}

function assertParsed(map, file, label) {
  if (map.size === 0) {
    errors.push(`${file}: could not read any ${label}; the check would pass vacuously.`);
  }
}

async function loadDashboardLinks() {
  const source = await read(DASHBOARD);
  const links = new Map();
  let currentFlag = null;

  for (const line of source.split(/\r?\n/)) {
    const guard = line.match(/if \((can\w+)\)/);
    if (guard) currentFlag = guard[1];

    const href = line.match(/href:\s*"(\/admin[^"]*)"/);
    if (href) {
      if (!links.has(href[1])) links.set(href[1], currentFlag);
    }
  }

  return links;
}

async function loadAdminApiRoutes() {
  const results = [];
  let entries;
  try {
    entries = await readdir(path.join(ROOT, ADMIN_API), { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const collect = async (relative) => {
      let children;
      try {
        children = await readdir(path.join(ROOT, relative), { withFileTypes: true });
      } catch {
        return;
      }
      for (const child of children) {
        const childPath = `${relative}/${child.name}`;
        if (child.isDirectory()) await collect(childPath);
        else if (child.name === "route.ts") {
          const source = await read(childPath);
          results.push({ file: childPath, source });
        }
      }
    };

    await collect(`${ADMIN_API}/${entry.name}`);
  }

  return results;
}

function normaliseVisible(expression) {
  const trimmed = expression.trim();
  if (trimmed === "true") return null; // always visible
  const flag = trimmed.match(/^session\.(can\w+)$/);
  return flag ? flag[1] : `unparseable:${trimmed}`;
}

async function main() {
  const { flags, roles, sessionFor } = await loadFlags();
  const pages = await loadPageGuards();
  const nav = await loadShellNav();
  const dashboard = await loadDashboardLinks();
  const apiRoutes = await loadAdminApiRoutes();

  assertParsed(nav, SHELL, "nav items");
  assertParsed(dashboard, DASHBOARD, "quick links");
  if (pages.size === 0) errors.push(`${ADMIN_PAGES}: no admin pages found.`);

  const flagNames = new Set(flags.map((flag) => flag.name));

  // 1. Nav ↔ guard agreement.
  for (const [route, navExpression] of nav) {
    const page = pages.get(route);
    if (!page) {
      errors.push(`Nav links to ${route}, which has no page.`);
      continue;
    }
    const navFlag = normaliseVisible(navExpression);
    if (navFlag && navFlag.startsWith("unparseable:")) {
      errors.push(`${SHELL}: cannot parse visible condition for ${route} (${navExpression}).`);
      continue;
    }
    if (navFlag !== page.flag) {
      errors.push(
        `Nav mismatch for ${route}: sidebar uses ${navFlag ?? "always visible"}, ` +
          `${page.file} requires ${page.flag ?? "no permission"}.`
      );
    }
  }

  // 2. Every guarded page must be reachable from the sidebar.
  for (const [route, page] of pages) {
    if (!nav.has(route)) {
      errors.push(`${page.file}: no sidebar entry, so the page is unreachable.`);
    }
  }

  // 3. Dashboard cards ↔ page guards.
  for (const [route, cardFlag] of dashboard) {
    const page = pages.get(route);
    if (!page) {
      errors.push(`Dashboard card links to ${route}, which has no page.`);
      continue;
    }
    if (cardFlag !== page.flag) {
      errors.push(
        `Dashboard card mismatch for ${route}: card uses ${cardFlag ?? "no guard"}, ` +
          `${page.file} requires ${page.flag ?? "no permission"}.`
      );
    }
  }

  for (const [route, page] of pages) {
    if (route === "/admin") continue;
    if (!dashboard.has(route)) {
      warnings.push(`Dashboard has no quick link for ${route} (guard: ${page.flag ?? "none"}).`);
    }
  }

  // 4. Every referenced flag must exist.
  for (const flag of [...nav.values()].map(normaliseVisible)) {
    if (flag && !flag.startsWith("unparseable:") && !flagNames.has(flag)) {
      errors.push(`${SHELL}: unknown flag ${flag}.`);
    }
  }
  for (const flag of dashboard.values()) {
    if (flag && !flagNames.has(flag)) errors.push(`${DASHBOARD}: unknown flag ${flag}.`);
  }

  // 5. Admin API routes must authenticate and check a permission.
  for (const { file, source } of apiRoutes) {
    if (!source.includes("getAdminSession")) {
      errors.push(`${file}: does not call getAdminSession().`);
    }
    if (!/session\.can\w+/.test(source)) {
      errors.push(`${file}: checks a session but never a can* permission.`);
    }
    if (!/status:\s*401/.test(source)) {
      warnings.push(`${file}: never returns 401 for unauthenticated callers.`);
    }
  }

  // Report.
  console.log("\nPermission matrix\n");
  console.log("Destination          Guard                 admin secretary treasurer");
  const roleNames = roles.length ? roles : ["admin", "secretary", "treasurer"];
  const sessions = Object.fromEntries(roleNames.map((role) => [role, sessionFor(role)]));

  const routes = [...pages.keys()].sort();
  for (const route of routes) {
    const page = pages.get(route);
    const cells = roleNames.map((role) => {
      const session = sessions[role];
      const allowed = page.flag ? Boolean(session[page.flag]) : true;
      return `${allowed ? "  ✓  " : "  ·  "}`.padEnd(10);
    });
    console.log(
      `${route.padEnd(21)}${(page.flag ?? "—").padEnd(22)}${cells.join("")}`
    );
  }

  for (const warning of warnings) console.warn(`\n⚠ ${warning}`);

  if (errors.length) {
    console.error(`\n✖ ${errors.length} permission inconsistency(ies):\n`);
    for (const error of errors) console.error(`  • ${error}`);
    console.error("");
    process.exit(1);
  }

  console.log(
    `\n✓ ${routes.length} destinations consistent across flags, guards, sidebar and dashboard.\n`
  );
}

main().catch((error) => {
  console.error(`\n✖ Permission check failed to run: ${error.message}\n`);
  process.exit(1);
});
