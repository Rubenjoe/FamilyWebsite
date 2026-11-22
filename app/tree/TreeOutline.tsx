import type { Member } from "./FamilyTree";

/**
 * The canvas tree is drag-and-zoom only: it cannot be explored with a keyboard,
 * read by a screen reader, or printed. This renders the same parent/child
 * structure as nested lists inside a native <details>, so nothing here needs
 * JavaScript to work.
 */

function years(member: Member): string {
  const birth = member.birth_date?.slice(0, 4);
  const death = member.death_date?.slice(0, 4);
  if (birth && death) return `${birth}–${death}`;
  if (birth) return `b. ${birth}`;
  if (death) return `d. ${death}`;
  return "";
}

export default function TreeOutline({ members }: { members: Member[] }) {
  const byId = new Map(members.map((member) => [member.id, member]));
  const childrenOf = new Map<string, Member[]>();
  const roots: Member[] = [];

  for (const member of members) {
    const parentId = [member.father_id, member.mother_id].find(
      (id): id is string => Boolean(id) && byId.has(id as string)
    );

    if (!parentId) {
      roots.push(member);
      continue;
    }

    const siblings = childrenOf.get(parentId) ?? [];
    siblings.push(member);
    childrenOf.set(parentId, siblings);
  }

  const byName = (a: Member, b: Member) =>
    (a.name ?? "").localeCompare(b.name ?? "");

  roots.sort(byName);
  for (const siblings of childrenOf.values()) siblings.sort(byName);

  const renderBranch = (
    member: Member,
    depth: number,
    visited: Set<string>
  ): React.ReactNode => {
    // Defensive: malformed data with a cycle would otherwise recurse forever.
    if (visited.has(member.id) || depth > 24) return null;

    const nextVisited = new Set(visited);
    nextVisited.add(member.id);
    const children = childrenOf.get(member.id) ?? [];

    return (
      <li key={member.id} className="text-[13px] leading-relaxed text-[#1b3622]">
        <span className="font-medium">{member.name || "Unnamed record"}</span>
        {years(member) && (
          <span className="ml-2 font-mono text-[11px] text-[#1b3622]/55">
            {years(member)}
          </span>
        )}
        {children.length > 0 && (
          <ul className="mt-1 ml-3 space-y-1 border-l border-[#1b3622]/10 pl-4">
            {children.map((child) =>
              renderBranch(child, depth + 1, nextVisited)
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <details className="mx-auto mt-8 max-w-[1100px] rounded-2xl border border-[#1b3622]/10 bg-white px-5 py-4">
      <summary className="cursor-pointer text-sm font-semibold text-[#1b3622] marker:text-[#8a6a0f]">
        Read the lineage as a text outline
      </summary>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[#1b3622]/60">
        The interactive tree is drawn on a canvas that is explored by dragging.
        This outline lists the same {members.length} records parent by parent, so
        it can be read with a keyboard, a screen reader, or printed.
      </p>
      <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
        <ul className="space-y-1">
          {roots.map((root) => renderBranch(root, 0, new Set<string>()))}
        </ul>
      </div>
    </details>
  );
}
