"use client";

import Link from "next/link";
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  ShieldCheck,
  UserPlus,
  CalendarPlus,
  DollarSign,
} from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";

interface AdminDashboardClientProps {
  memberCount: number;
  eventCount: number;
  role: string;
  canEditMembers: boolean;
  canEditEvents: boolean;
  canViewDues: boolean;
}

export default function AdminDashboardClient({
  memberCount,
  eventCount,
  role,
  canEditMembers,
  canEditEvents,
  canViewDues,
}: AdminDashboardClientProps) {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Platform Analytics Summary"
        subtitle={`Signed in as ${role}. All administrative actions are logged.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">
              Total Directory Rows
            </span>
            <span className="text-2xl font-semibold text-[#1b3622] block">{memberCount}</span>
          </div>
          <Users className="h-8 w-8 text-gray-200" />
        </div>
        <div className="bg-white border border-gray-100 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">
              Scheduled Assemblies
            </span>
            <span className="text-2xl font-semibold text-[#1b3622] block">{eventCount}</span>
          </div>
          <Calendar className="h-8 w-8 text-gray-200" />
        </div>
        <div className="bg-white border border-gray-100 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">
              Document Asset Nodes
            </span>
            <span className="text-2xl font-semibold text-[#1b3622] block">—</span>
          </div>
          <FileText className="h-8 w-8 text-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {canEditMembers && (
          <div className="bg-white border border-gray-100 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#d4af37]">
              <UserPlus className="h-5 w-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#2d312e]">
                Member Registry
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Manage family members, relationships, photos, and life dates.
            </p>
            <Link
              href="/admin/members"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-[#1b3622] hover:text-[#d4af37] transition-colors"
            >
              Open member manager →
            </Link>
          </div>
        )}

        {canEditEvents && (
          <div className="bg-white border border-gray-100 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#d4af37]">
              <CalendarPlus className="h-5 w-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#2d312e]">
                Events & Announcements
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Schedule upcoming gatherings and keep a record of past events.
            </p>
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-[#1b3622] hover:text-[#d4af37] transition-colors"
            >
              Open event scheduler →
            </Link>
          </div>
        )}

        {canViewDues && (
          <div className="bg-white border border-gray-100 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#d4af37]">
              <DollarSign className="h-5 w-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#2d312e]">
                Dues & Finances
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Treasurer-only view for family dues and financial records.
            </p>
            <Link
              href="/admin/dues"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-[#1b3622] hover:text-[#d4af37] transition-colors"
            >
              Open dues view →
            </Link>
          </div>
        )}

        <div className="bg-white border border-gray-100 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#d4af37]">
            <BarChart3 className="h-5 w-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#2d312e]">
              Audit & Security
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-light leading-relaxed">
            Review recent administrative actions and role assignments.
          </p>
          <Link
            href="/admin/audit-log"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-[#1b3622] hover:text-[#d4af37] transition-colors"
          >
            Open audit log →
          </Link>
        </div>
      </div>

      <div className="bg-white border border-[#1b3622]/5 p-6 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#2d312e] flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
          <span>Role-Based Access Active</span>
        </h3>
        <p className="text-xs text-gray-500 font-light leading-relaxed">
          Your current role is <span className="font-semibold text-[#1b3622]">{role}</span>. Role visibility determines which sections of the admin desk are available. All member, event, and role changes are recorded in the audit log.
        </p>
      </div>
    </div>
  );
}
