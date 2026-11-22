#!/usr/bin/env node
/**
 * Full JSON backup of the Pulazhiyil archive database.
 *
 * The genealogy registry is the one thing on this site that cannot be
 * reconstructed from source code, so it gets a dump that can be committed to a
 * private store or copied to a drive. Runs against the Supabase REST API with a
 * service-role key, because a public key cannot read every row.
 *
 * Usage:
 *   node scripts/backup.mjs                 # writes backups/<timestamp>/
 *   node scripts/backup.mjs --out D:\dumps  # custom destination
 *
 * Required environment (read from .env.local, .env, or the real environment):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * The output contains personal data — `backups/` is gitignored. Never commit it.
 */

import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";

const TABLES = [
  "members",
  "events",
  "gallery_records",
  "heritage_records",
  "committee_members",
  "admin_users",
  "audit_log",
];

const PAGE_SIZE = 1000;

function parseEnvFile(contents) {
  const out = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

async function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const contents = await readFile(path.resolve(process.cwd(), file), "utf8");
      for (const [key, value] of Object.entries(parseEnvFile(contents))) {
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      // Missing file is fine; the real environment may hold the values.
    }
  }
}

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}T${pad(
    now.getUTCHours()
  )}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

function fatal(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

async function fetchTable(baseUrl, serviceKey, table) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = `${baseUrl}/rest/v1/${table}?select=*&limit=${PAGE_SIZE}&offset=${offset}`;
    const response = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `${table}: HTTP ${response.status} ${detail.slice(0, 300)}`.trim()
      );
    }

    const page = await response.json();
    if (!Array.isArray(page)) {
      throw new Error(`${table}: expected an array, got ${typeof page}`);
    }
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

async function main() {
  await loadEnv();

  const args = process.argv.slice(2);
  const outFlag = args.indexOf("--out");
  const destination =
    outFlag !== -1 && args[outFlag + 1]
      ? path.resolve(args[outFlag + 1])
      : path.resolve(process.cwd(), "backups", timestamp());

  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const missing = [];
  if (!baseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) {
    fatal(
      `Missing ${missing.join(" and ")}. Add them to .env.local (or export them) and run again.\n` +
        "  The service-role key is in Supabase → Project Settings → API. It is never\n" +
        "  shipped to the browser; this script runs locally only."
    );
  }

  if (!/^https?:\/\//.test(baseUrl)) {
    fatal(`NEXT_PUBLIC_SUPABASE_URL does not look like a URL: ${baseUrl}`);
  }

  console.log(`Archiving ${baseUrl} → ${destination}`);

  try {
    await stat(destination);
    fatal(`Destination already exists: ${destination}. Choose a new --out path.`);
  } catch {
    // Does not exist yet — that is what we want.
  }

  await mkdir(destination, { recursive: true });

  const manifest = {
    createdAt: new Date().toISOString(),
    projectHost: new URL(baseUrl).host,
    tables: {},
    totals: { tables: 0, rows: 0 },
  };

  for (const table of TABLES) {
    try {
      const rows = await fetchTable(baseUrl, serviceKey, table);
      await writeFile(
        path.join(destination, `${table}.json`),
        JSON.stringify(rows, null, 2)
      );
      manifest.tables[table] = { rows: rows.length, ok: true };
      manifest.totals.rows += rows.length;
      manifest.totals.tables += 1;
      console.log(`  ✓ ${table.padEnd(18)} ${rows.length} rows`);

      // Row-level security answers an empty array rather than an error, so a
      // key without the service role can look like a clean backup of empty
      // tables. Flag it instead of letting that pass silently.
      if (rows.length === 0) {
        console.warn(
          `    ⚠ ${table} is empty — confirm that is genuine and not a key without\n` +
            "      service-role privileges (RLS hides rows without erroring)."
        );
      }
    } catch (error) {
      manifest.tables[table] = {
        rows: 0,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
      console.error(`  ✗ ${table.padEnd(18)} ${error.message}`);
    }
  }

  await writeFile(
    path.join(destination, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  const failed = Object.entries(manifest.tables).filter(([, t]) => !t.ok);

  if (failed.length) {
    fatal(
      `${failed.length} table(s) failed, so this is an incomplete backup: ` +
        failed.map(([name]) => name).join(", ") +
        `\n  Files were still written to ${destination} — do not rely on them.`
    );
  }

  console.log(
    `\n✓ Backup complete: ${manifest.totals.rows} rows across ${manifest.totals.tables} tables.\n  ${destination}\n`
  );
}

main().catch((error) => {
  fatal(error instanceof Error ? error.stack || error.message : String(error));
});
