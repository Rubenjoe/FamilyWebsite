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
  ArrowRight,
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

interface QuickLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta: string;
}

export default function AdminDashboardClient({
  memberCount,
  eventCount,
  role,
  canEditMembers,
  canEditEvents,
  canViewDues,
}: AdminDashboardClientProps) {
  const quickLinks: QuickLink[] = [];
  if (canEditMembers) {
    quickLinks.push({
      href: "/admin/members",
      icon: UserPlus,
      title: "Member Registry",
      description: "Manage family members, relationships, photos, and life dates.",
      cta: "Open member manager",
    });
  }
  if (canEditEvents) {
    quickLinks.push({
      href: "/admin/events",
      icon: CalendarPlus,
      title: "Events & Announcements",
      description: "Schedule upcoming gatherings and keep a record of past events.",
      cta: "Open event scheduler",
    });
  }
  if (canViewDues) {
    quickLinks.push({
      href: "/admin/dues",
      icon: DollarSign,
      title: "Dues & Finances",
      description: "Treasurer-only view for family dues and financial records.",
      cta: "Open dues view",
    });
  }
  quickLinks.push({
    href: "/admin/audit-log",
    icon: BarChart3,
    title: "Audit & Security",
    description: "Review recent administrative actions and role assignments.",
    cta: "Open audit log",
  });

  const stats = [
    { label: "Total Directory Rows", value: memberCount.toLocaleString(), icon: Users },
    { label: "Scheduled Assemblies", value: eventCount.toLocaleString(), icon: Calendar },
    { label: "Document Asset Nodes", value: "—", icon: FileText },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <AdminPageHeader
        title="Platform Analytics Summary"
        subtitle={`Signed in as ${role}. All administrative actions are logged.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group bg-white border border-[#1b3622]/10 p-6 shadow-sm hover:shadow-[0_12px_32px_rgba(27,54,34,0.10)] hover:border-[#d4af37]/30 transition-all duration-400 ease-premium relative overflow-hidden"
            >
              <span aria-hidden className="absolute top-0 left-0 right-0 h-0.5 origin-left scale-x-0 bg-[#d4af37] transition-transform duration-500 ease-premium group-hover:scale-x-100" />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 block font-bold">
                    {stat.label}
                  </span>
                  <span className="text-3xl font-serif text-[#1b3622] block leading-tight">
                    {stat.value}
                  </span>
                </div>
                <div className="h-11 w-11 rounded-full bg-[#1b3622]/5 border border-[#d4af37]/25 grid place-items-center shrink-0">
                  <Icon className="h-5 w-5 text-[#a57f12] stroke-[1.5]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <div
              key={link.href}
              className="group bg-white border border-[#1b3622]/10 p-6 shadow-sm space-y-3 hover:shadow-[0_12px_32px_rgba(27,54,34,0.10)] hover:border-[#d4af37]/30 transition-all duration-400 ease-premium"
            >
              <div className="flex items-center gap-2.5 text-[#a57f12]">
                <Icon className="h-5 w-5 stroke-[1.5]" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2d312e]">
                  {link.title}
                </h3>
              </div>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                {link.description}
              </p>
              <Link
                href={link.href}
                className="group/link inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1b3622] hover:text-[#a57f12] transition-colors duration-200"
              >
                <span className="border-b border-[#1b3622]/20 group-hover/link:border-[#a57f12] pb-0.5 transition-colors">
                  {link.cta}
                </span>
                <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-premium group-hover/link:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[#1b3622]/10 p-6 space-y-3 shadow-sm relative overflow-hidden">
        <span aria-hidden className="absolute top-0 left-0 right-0 h-0.5 bg-[#d4af37]/70" />
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2d312e] flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#a57f12]" />
          <span>Role-Based Access Active</span>
        </h3>
        <p className="text-sm text-gray-500 font-light leading-relaxed">
          Your current role is <span className="font-semibold text-[#1b3622]">{role}</span>. Role visibility determines which sections of the admin desk are available. All member, event, and role changes are recorded in the audit log.
        </p>
      </div>
    </div>
  );
}
