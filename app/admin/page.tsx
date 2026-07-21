"use client";

import { useState } from "react";
import {
    Users, Calendar, FileText, BarChart3,
    ShieldCheck, UserPlus, CalendarPlus, CheckCircle2, LayoutDashboard
} from "lucide-react";
import { MOCK_MEMBERS, MOCK_EVENTS, MOCK_DOCUMENTS } from "../../data/mockData";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "members" | "events">("overview");

    // Local states to handle mock form entries
    const [membersList, setMembersList] = useState(MOCK_MEMBERS);
    const [eventsList, setEventsList] = useState(MOCK_EVENTS);
    const [notification, setNotification] = useState<string | null>(null);

    // Form state tracking variables
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberBranch, setNewMemberBranch] = useState<"Vadakke" | "Kizhake" | "Thekke" | "Padinjare">("Vadakke");
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventDate, setNewEventDate] = useState("");

    // Trigger transient toast feedback
    const triggerToast = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
    };

    // Submission handles
    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName) return;

        const [firstName, ...rest] = newMemberName.split(" ");
        const lastName = rest.join(" ") || "Pulazhiyil";

        const newlyCreated = {
            id: `m-local-${Date.now()}`,
            firstName,
            lastName,
            branch: newMemberBranch,
            generation: 4,
            birthDate: "1998-01-01",
            isAlive: true,
            location: "Kerala, India",
            biography: "Newly added administrative profile entry record awaiting cloud database sync authorization.",
            profilePhotoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400",
            relationships: {}
        };

        setMembersList([newlyCreated, ...membersList]);
        setNewMemberName("");
        triggerToast(`Successfully registered ${firstName} into the ${newMemberBranch} Branch records!`);
    };

    const handleCreateEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle || !newEventDate) return;

        const newlyCreatedEvent = {
            id: `e-local-${Date.now()}`,
            title: newEventTitle,
            date: newEventDate,
            description: "Custom administrative entry assembly launched from local desk console.",
            location: "Ancestral Assembly Grounds, Thrissur",
            status: "upcoming" as const
        };

        setEventsList([newlyCreatedEvent, ...eventsList]);
        setNewEventTitle("");
        setNewEventDate("");
        triggerToast(`New assembly gathering event successfully broadcasted!`);
    };

    return (
        <div className="min-h-screen bg-[#fbf9f4] flex flex-col lg:flex-row">

            {/* 1. COMPACT SIDEBAR CONTROLLER */}
            <aside className="w-full lg:w-64 bg-[#1b3622] text-[#fbf9f4]/80 px-6 py-8 flex flex-col justify-between shrink-0 border-r border-[#d4af37]/10">
                <div className="space-y-8">
                    <div className="flex items-center gap-2.5 border-b border-[#fbf9f4]/10 pb-4">
                        <ShieldCheck className="h-5 w-5 text-[#d4af37]" />
                        <div>
                            <span className="block text-xs font-bold uppercase tracking-widest text-[#fbf9f4]">
                                Staff Archive Desk
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">Status: Local Host Mode</span>
                        </div>
                    </div>

                    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 text-xs uppercase tracking-widest font-semibold">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left shrink-0 transition-colors ${activeTab === "overview" ? "bg-[#d4af37] text-[#1b3622]" : "hover:bg-white/5"
                                }`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Overview</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left shrink-0 transition-colors ${activeTab === "members" ? "bg-[#d4af37] text-[#1b3622]" : "hover:bg-white/5"
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            <span>Records ({membersList.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("events")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left shrink-0 transition-colors ${activeTab === "events" ? "bg-[#d4af37] text-[#1b3622]" : "hover:bg-white/5"
                                }`}
                        >
                            <Calendar className="h-4 w-4" />
                            <span>Gatherings ({eventsList.length})</span>
                        </button>
                    </nav>
                </div>

                <div className="hidden lg:block pt-6 border-t border-[#fbf9f4]/5 text-[10px] text-gray-400 leading-normal font-light">
                    Secured session. Changes exist locally until cloud database synchronization is finalized.
                </div>
            </aside>

            {/* 2. DYNAMIC WORKSPACE PANEL */}
            <main className="flex-grow p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8 relative">

                {/* Real-time Toast Feedback Banner */}
                {notification && (
                    <div className="fixed top-24 right-6 bg-[#1b3622] border border-[#d4af37]/30 text-[#fbf9f4] px-4 py-3 shadow-xl z-50 text-xs font-medium tracking-wide flex items-center gap-2 animate-fade-in animate-bounce">
                        <CheckCircle2 className="h-4 w-4 text-[#d4af37]" />
                        <span>{notification}</span>
                    </div>
                )}

                {/* TAB CONTENT: METRICS OVERVIEW */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-serif text-[#1b3622]">Platform Analytics Summary</h1>
                            <p className="text-xs text-gray-500 font-light">System parameters status monitoring feed logs.</p>
                        </div>

                        {/* Quick Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white border border-gray-100 p-6 flex items-center justify-between shadow-sm">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">Total Directory Rows</span>
                                    <span className="text-2xl font-semibold text-[#1b3622] block">{membersList.length}</span>
                                </div>
                                <Users className="h-8 w-8 text-gray-200" />
                            </div>
                            <div className="bg-white border border-gray-100 p-6 flex items-center justify-between shadow-sm">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">Scheduled Assemblies</span>
                                    <span className="text-2xl font-semibold text-[#1b3622] block">{eventsList.length}</span>
                                </div>
                                <Calendar className="h-8 w-8 text-gray-200" />
                            </div>
                            <div className="bg-white border border-gray-100 p-6 flex items-center justify-between shadow-sm">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">Document Asset Nodes</span>
                                    <span className="text-2xl font-semibold text-[#1b3622] block">{MOCK_DOCUMENTS.length}</span>
                                </div>
                                <FileText className="h-8 w-8 text-gray-200" />
                            </div>
                        </div>

                        {/* Explainer Notice */}
                        <div className="bg-white border border-[#1b3622]/5 p-6 space-y-3 shadow-sm">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#2d312e] flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-[#d4af37]" />
                                <span>Next Milestone Preview: Supabase Backend Sync</span>
                            </h3>
                            <p className="text-xs text-gray-500 font-light leading-relaxed">
                                Right now, this engine uses React memory state. When you refresh the page, any records added below will clear. In an upcoming milestone, we will connect this control layout to a cloud PostgreSQL database to allow permanent global storage.
                            </p>
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: MEMBERS MANAGER */}
                {activeTab === "members" && (
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-serif text-[#1b3622]">Registry Record Manager</h1>
                            <p className="text-xs text-gray-500 font-light">Add new relative rows directly into the front-end state pool.</p>
                        </div>

                        {/* Split view: Add Form vs Registry Peek */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                            {/* Form Input Deck */}
                            <form onSubmit={handleAddMember} className="md:col-span-5 bg-white border border-gray-100 p-6 space-y-4 shadow-sm">
                                <h3 className="text-xs uppercase tracking-widest text-[#d4af37] font-bold border-b border-gray-50 pb-2 flex items-center gap-1.5">
                                    <UserPlus className="h-3.5 w-3.5" />
                                    <span>Enroll Family Member</span>
                                </h3>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Full Profile Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ramesh Pulazhiyil"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Lineage Branch Segment</label>
                                    <select
                                        value={newMemberBranch}
                                        onChange={(e) => setNewMemberBranch(e.target.value as "Vadakke" | "Kizhake" | "Thekke" | "Padinjare")}
                                        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
                                    >
                                        <option value="Vadakke">Vadakke Branch</option>
                                        <option value="Kizhake">Kizhake Branch</option>
                                        <option value="Thekke">Thekke Branch</option>
                                        <option value="Padinjare">Padinjare Branch</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#1b3622] text-[#fbf9f4] py-2.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors"
                                >
                                    Insert Member Row
                                </button>
                            </form>

                            {/* Data Rows Peek */}
                            <div className="md:col-span-7 bg-white border border-gray-100 p-6 space-y-3 shadow-sm h-96 overflow-y-auto">
                                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-50 pb-2">
                                    Active Runtime Grid Registry Rows
                                </h3>
                                {membersList.map(m => (
                                    <div key={m.id} className="flex justify-between items-center text-xs border-b border-gray-50 py-2">
                                        <div>
                                            <span className="font-medium text-[#2d312e]">{m.firstName} {m.lastName}</span>
                                            <span className="block text-[10px] text-gray-400 font-light">{m.location}</span>
                                        </div>
                                        <span className="text-[9px] uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 font-semibold">
                                            {m.branch}
                                        </span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                )}

                {/* TAB CONTENT: EVENTS SCHEDULER */}
                {activeTab === "events" && (
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-serif text-[#1b3622]">Gathering Assembly Scheduler</h1>
                            <p className="text-xs text-gray-500 font-light">Announce and log upcoming multi-branch regional meetings.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                            {/* Form Input Box */}
                            <form onSubmit={handleCreateEvent} className="md:col-span-5 bg-white border border-gray-100 p-6 space-y-4 shadow-sm">
                                <h3 className="text-xs uppercase tracking-widest text-[#d4af37] font-bold border-b border-gray-50 pb-2 flex items-center gap-1.5">
                                    <CalendarPlus className="h-3.5 w-3.5" />
                                    <span>Broadcast Gathering</span>
                                </h3>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Assembly Summit Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. South Gulf Chapter Assembly"
                                        value={newEventTitle}
                                        onChange={(e) => setNewEventTitle(e.target.value)}
                                        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Execution Calendar Date</label>
                                    <input
                                        type="date"
                                        value={newEventDate}
                                        onChange={(e) => setNewEventDate(e.target.value)}
                                        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#1b3622] text-[#fbf9f4] py-2.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors"
                                >
                                    Deploy Assembly Log
                                </button>
                            </form>

                            {/* Events Output Feed */}
                            <div className="md:col-span-7 bg-white border border-gray-100 p-6 space-y-3 shadow-sm h-96 overflow-y-auto">
                                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-50 pb-2">
                                    Scheduled Gathering Board Rows
                                </h3>
                                {eventsList.map(e => (
                                    <div key={e.id} className="text-xs border-b border-gray-50 py-2.5 space-y-0.5">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-[#1b3622]">{e.title}</span>
                                            <span className="font-mono text-[10px] text-gray-400">{e.date}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-light truncate">{e.description}</p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}