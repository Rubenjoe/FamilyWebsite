"use client";

import Link from "next/link";
import {
  Users,
  Calendar,
  Images,
  ScrollText,
  ShieldCheck,
  UserPlus,
  CalendarPlus,
  DollarSign,
  BookOpen,
  Users2,
  ArrowRight,
} from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";

interface AdminDashboardClientProps {
  memberCount: number;
  eventCount: number;
  galleryCount: number;
  role: string;
  canEditMembers: boolean;
  canEditEvents: boolean;
  canViewDues: boolean;
  canViewAudit: boolean;
  canManageRoles: boolean;
}

interface QuickLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  secretary: "Secretary",
  treasurer: "Treasurer",
};

export default function AdminDashboardClient({
  memberCount,
  eventCount,
  galleryCount,
  role,
  canEditMembers,
  canEditEvents,
  canViewDues,
  canViewAudit,
  canManageRoles,
}: AdminDashboardClientProps) {
  // Every card here must point at a page the signed-in role can actually open:
  // the destinations redirect to /dashboard when the permission is missing.
  const quickLinks: QuickLink[] = [];
  if (canEditMembers) {
    quickLinks.push(
      {
        href: "/admin/members",
        icon: UserPlus,
        title: "Member Registry",
        description:
          "Manage family members, relationships, photos, and life dates.",
        cta: "Open member manager",
      },
      {
        href: "/admin/committee",
        icon: Users2,
        title: "Committee Roster",
        description: "Keep the current office bearers and their contacts current.",
        cta: "Open committee roster",
      },
      {
        href: "/admin/gallery",
        icon: Images,
        title: "Photographic Archive",
        description: "Upload, caption and order the photographs in the vault.",
        cta: "Open gallery manager",
      },
      {
        href: "/admin/heritage",
        icon: BookOpen,
        title: "Heritage Records",
        description: "Edit the chronicle entries that shape the family history.",
        cta: "Open heritage editor",
      }
    );
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
  if (canManageRoles) {
    quickLinks.push({
      href: "/admin/roles",
      icon: ShieldCheck,
      title: "Roles & Access",
      description:
        "Grant or revoke administrative roles and review who can edit what.",
      cta: "Open role manager",
    });
  }
  if (canViewAudit) {
    quickLinks.push({
      href: "/admin/audit-log",
      icon: ScrollText,
      title: "Audit & Security",
      description: "Review recent administrative actions and role assignments.",
      cta: "Open audit log",
    });
  }

  const stats = [
    { label: "Total Directory Rows", value: memberCount, icon: Users },
    { label: "Scheduled Assemblies", value: eventCount, icon: Calendar },
    { label: "Archived Photographs", value: galleryCount, icon: Images },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <AdminPageHeader
          title="Platform Analytics Summary"
          subtitle={`Signed in as ${ROLE_LABELS[role] ?? role}. All administrative actions are logged.`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{ animationDelay: `${index * 70}ms` }}
              className="animate-fade-up group relative overflow-hidden border border-[#1b3622]/10 bg-white p-6 shadow-sm transition-all duration-300 ease-premium hover:border-[#d4af37]/30 hover:shadow-[0_12px_32px_rgba(27,54,34,0.10)]"
            >
              <span
                aria-hidden
                className="absolute left-0 right-0 top-0 h-0.5 origin-left scale-x-0 bg-[#d4af37] transition-transform duration-500 ease-premium group-hover:scale-x-100"
              />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    {stat.label}
                  </span>
                  <span className="block font-serif text-3xl leading-tight text-[#1b3622]">
                    {stat.value.toLocaleString()}
                  </span>
                </div>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d4af37]/25 bg-[#1b3622]/5 transition-colors duration-300 group-hover:bg-[#d4af37]/10">
                  <Icon className="h-5 w-5 stroke-[1.5] text-[#a57f12]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{ animationDelay: `${120 + index * 60}ms` }}
              className="animate-fade-up group relative flex flex-col justify-between gap-3 border border-[#1b3622]/10 bg-white p-6 shadow-sm transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-[#d4af37]/30 hover:shadow-[0_12px_32px_rgba(27,54,34,0.10)]"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-[#d4af37] transition-transform duration-400 ease-premium group-hover:scale-y-100"
              />
              <div className="flex items-center gap-2.5 text-[#a57f12]">
                <Icon className="h-5 w-5 stroke-[1.5]" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2d312e]">
                  {link.title}
                </h3>
              </div>
              <p className="text-sm font-light leading-relaxed text-gray-500">
                {link.description}
              </p>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1b3622] transition-colors duration-200 group-hover:text-[#a57f12]">
                <span className="border-b border-[#1b3622]/20 pb-0.5 transition-colors group-hover:border-[#a57f12]">
                  {link.cta}
                </span>
                <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="relative overflow-hidden border border-[#1b3622]/10 bg-white p-6 shadow-sm">
        <span aria-hidden className="absolute left-0 right-0 top-0 h-0.5 bg-[#d4af37]/70" />
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#2d312e]">
          <ShieldCheck className="h-4 w-4 text-[#a57f12]" />
          <span>Role-Based Access Active</span>
        </h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-gray-500">
          Your current role is{" "}
          <span className="font-semibold text-[#1b3622]">
            {ROLE_LABELS[role] ?? role}
          </span>
          . Role visibility determines which sections of the admin desk are
          available — only the cards your role can open are listed above. All
          member, event, and role changes are recorded in the audit log.
        </p>
      </div>
    </div>
  );
}
