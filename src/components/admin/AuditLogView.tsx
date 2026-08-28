"use client";

import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import type { Database } from "@/types/supabase";
import AdminPageHeader from "./AdminPageHeader";

type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

interface AuditLogViewProps {
  initialLogs: AuditLogRow[];
}

const ACTION_OPTIONS = [
  "all",
  "members.create",
  "members.update",
  "members.delete",
  "events.create",
  "events.update",
  "events.delete",
  "admin_users.create",
  "admin_users.update",
  "admin_users.delete",
];

export default function AuditLogView({ initialLogs }: AuditLogViewProps) {
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const matchesUser =
        !userFilter ||
        log.user_id?.toLowerCase().includes(userFilter.toLowerCase()) ||
        false;
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      return matchesUser && matchesAction;
    });
  }, [initialLogs, userFilter, actionFilter]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Audit Log"
        subtitle="Recent administrative actions, most recent first."
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white border border-gray-100 p-4 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by user ID..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full bg-[#fbf9f4] border border-gray-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1b3622]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622] w-full sm:w-auto"
          >
            {ACTION_OPTIONS.map((action) => (
              <option key={action} value={action}>
                {action === "all" ? "All actions" : action}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fbf9f4] border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Target</th>
                <th className="px-4 py-3 text-left font-semibold">Changes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 font-light">
                    No audit entries match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 last:border-b-0 hover:bg-[#fbf9f4]/50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase tracking-wider font-semibold bg-[#1b3622]/5 text-[#1b3622] px-2 py-1">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 truncate max-w-[140px]">
                      {log.user_id || "system"}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 truncate max-w-[140px]">
                      {log.target_id || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <pre className="text-[10px] text-gray-500 font-mono bg-[#fbf9f4] p-2 border border-gray-100 max-w-xs sm:max-w-md overflow-x-auto">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
