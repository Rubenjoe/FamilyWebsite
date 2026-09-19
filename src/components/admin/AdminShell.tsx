"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShieldCheck,
  ScrollText,
  DollarSign,
  BookOpen,
  ImageIcon,
  Menu,
  X,
  Users2,
} from "lucide-react";
import type { AdminSession } from "@/utils/admin";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
}

function roleLabel(role: AdminSession["role"]) {
  switch (role) {
    case "admin":
      return "Administrator";
    case "secretary":
      return "Secretary";
    case "treasurer":
      return "Treasurer";
  }
}

export default function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AdminSession;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, visible: true },
    { href: "/admin/members", label: "Members", icon: Users, visible: session.canEditMembers },
    { href: "/admin/committee", label: "Committee", icon: Users2, visible: session.canEditMembers },
    { href: "/admin/events", label: "Events", icon: Calendar, visible: session.canEditEvents },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, visible: session.canEditMembers },
    { href: "/admin/heritage", label: "Heritage", icon: BookOpen, visible: session.canEditMembers },
    { href: "/admin/roles", label: "Roles", icon: ShieldCheck, visible: session.canManageRoles },
    { href: "/admin/dues", label: "Dues", icon: DollarSign, visible: session.canViewDues },
    { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText, visible: session.canViewAudit },
  ];

  const visibleNavItems = navItems.filter((item) => item.visible);

  const renderNavItems = () =>
    visibleNavItems.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsMobileOpen(false)}
          aria-current={isActive ? "page" : undefined}
          className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left shrink-0 transition-colors duration-200 ${
            isActive
              ? "bg-[#d4af37]/15 text-[#fbf9f4]"
              : "text-[#fbf9f4]/70 hover:bg-white/5 hover:text-[#fbf9f4]"
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="adminNavIndicator"
              className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#d4af37] rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
            />
          )}
          <Icon className={`h-4 w-4 ${isActive ? "text-[#d4af37]" : ""}`} />
          <span className="tracking-widest">{item.label}</span>
        </Link>
      );
    });

  return (
    <div className="min-h-screen bg-[#fbf9f4] bg-parchment flex flex-col lg:flex-row">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1b3622] text-[#fbf9f4] border-b border-[#d4af37]/10">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-[#d4af37]" />
          <span className="text-xs font-bold uppercase tracking-widest">Staff Archive Desk</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-[#1b3622] text-[#fbf9f4]/80 px-6 py-8 flex flex-col justify-between shrink-0 border-r border-[#d4af37]/10">
        <div className="space-y-8">
          <div className="hidden lg:flex items-center gap-2.5 border-b border-[#fbf9f4]/10 pb-5">
            <ShieldCheck className="h-5 w-5 text-[#d4af37]" />
            <div>
              <span className="block text-xs font-bold uppercase tracking-widest text-[#fbf9f4]">
                Staff Archive Desk
              </span>
              <span className="text-[10px] text-[#d4af37]/90 font-mono uppercase tracking-[0.15em]">
                {roleLabel(session.role)}
              </span>
            </div>
          </div>

          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 text-xs uppercase font-semibold lg:border-t border-[#fbf9f4]/10 lg:pt-4">
            {renderNavItems()}
          </nav>
        </div>

        <div className="hidden lg:block pt-6 border-t border-[#fbf9f4]/5 text-[10px] text-[#fbf9f4]/50 leading-normal font-light">
          Signed in as {session.user.email || "unknown"}.<br />
          Secured session. All actions are logged.
        </div>
      </aside>

      {/* Mobile overlay nav */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-[#1b3622] border-t border-[#d4af37]/10 px-4 pb-4"
          >
            <nav className="flex flex-col gap-1 text-xs uppercase font-semibold">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${
                      isActive
                        ? "bg-[#d4af37] text-[#1b3622]"
                        : "text-[#fbf9f4]/80 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="tracking-widest">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full relative">
        {children}
      </main>
    </div>
  );
}
