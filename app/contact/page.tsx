"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Phone, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
    const [name, setName] = useState("");
    const [branch, setBranch] = useState("Vadakke");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) return;
        
        setIsLoading(true);
        // Simulate premium network request stream latency
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsSubmitted(true);

        // Reset values
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
    };

    return (
        <div className="min-h-screen bg-[#fbf9f4] pb-24">
            {/* Header section with refined typography */}
            <div className="bg-white border-b border-[#1b3622]/5 py-16 px-6">
                <div className="max-w-7xl mx-auto space-y-3 text-center">
                    <span className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-semibold block">
                        Family Liaison & Support
                    </span>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#1b3622] font-normal leading-tight">
                        Connect with Kudumbayogam
                    </h1>
                    <p className="text-gray-500 font-light max-w-xl mx-auto text-sm leading-relaxed pt-2">
                        Get in touch with our committee representatives regarding genealogical records, directory updates, archives, or event registrations.
                    </p>
                </div>
            </div>

            {/* Layout grid containing form and contact info */}
            <div className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* ── Left column: Premium Contact Details Cards ── */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-xs uppercase tracking-widest text-[#1b3622] font-bold tracking-[0.15em] border-b border-gray-100 pb-2">
                            Liaison Channels
                        </h2>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                            For urgent matters or archival access requests, feel free to visit or contact us directly.
                        </p>
                    </div>

                    <div className="bg-white border border-[#1b3622]/10 p-6 space-y-6 shadow-sm relative overflow-hidden">
                        {/* Subtle decorative elements */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#d4af37]" />
                        
                        {/* Address */}
                        <div className="flex gap-4 items-start">
                            <div className="h-9 w-9 rounded-full bg-[#1b3622]/5 flex items-center justify-center shrink-0 border border-[#d4af37]/20">
                                <MapPin className="h-4 w-4 text-[#1b3622]" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#2d312e]">Ancestral Tharavadu</h3>
                                <p className="text-xs text-gray-600 font-light leading-relaxed">
                                    Pulazhiyil Heritage House <br />
                                    Kudumbayogam Road, Thrissur <br />
                                    Kerala — 680001, India
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex gap-4 items-start">
                            <div className="h-9 w-9 rounded-full bg-[#1b3622]/5 flex items-center justify-center shrink-0 border border-[#d4af37]/20">
                                <Mail className="h-4 w-4 text-[#1b3622]" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#2d312e]">Digital Correspondence</h3>
                                <p className="text-xs text-gray-600 font-light leading-relaxed">
                                    General Desk: <span className="font-mono font-medium text-[#1b3622]">yogam@pulazhiyil.org</span> <br />
                                    Registry & Tree: <span className="font-mono font-medium text-[#1b3622]">archive@pulazhiyil.org</span>
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex gap-4 items-start">
                            <div className="h-9 w-9 rounded-full bg-[#1b3622]/5 flex items-center justify-center shrink-0 border border-[#d4af37]/20">
                                <Phone className="h-4 w-4 text-[#1b3622]" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#2d312e]">Direct Telephony</h3>
                                <p className="text-xs text-gray-600 font-light leading-relaxed font-mono">
                                    +91 487 2384 928 <br />
                                    +91 944 7289 104
                                </p>
                            </div>
                        </div>

                        {/* Timing */}
                        <div className="flex gap-4 items-start">
                            <div className="h-9 w-9 rounded-full bg-[#1b3622]/5 flex items-center justify-center shrink-0 border border-[#d4af37]/20">
                                <Clock className="h-4 w-4 text-[#1b3622]" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#2d312e]">Archive Hours</h3>
                                <p className="text-xs text-gray-600 font-light leading-relaxed">
                                    Saturdays & Sundays <br />
                                    10:00 AM — 04:00 PM IST
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/50 border border-dashed border-gray-200 p-6 rounded-sm space-y-2">
                        <h4 className="text-xs uppercase tracking-wider font-bold text-[#1b3622]">Response Window</h4>
                        <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                            Since the registry office is managed voluntarily by family committee members, email responses and member validation queues may take up to 48–72 hours. We appreciate your patience.
                        </p>
                    </div>
                </div>

                {/* ── Right column: Interactive Correspondence Form ── */}
                <div className="lg:col-span-7 bg-white border border-[#1b3622]/10 p-8 shadow-sm relative">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#d4af37]" />
                    
                    <h2 className="text-xs uppercase tracking-widest text-[#1b3622] font-bold tracking-[0.15em] border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                        <Send className="h-3.5 w-3.5 text-[#d4af37]" />
                        <span>Send Correspondence Log</span>
                    </h2>

                    <AnimatePresence mode="wait">
                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="py-12 text-center space-y-4"
                            >
                                <div className="h-12 w-12 bg-[#1b3622]/5 rounded-full flex items-center justify-center border border-[#d4af37]/35 mx-auto">
                                    <CheckCircle2 className="h-6 w-6 text-[#1b3622]" />
                                </div>
                                <h3 className="text-lg font-serif text-[#1b3622] font-semibold">Message Successfully Lodged</h3>
                                <p className="text-xs text-gray-500 font-light max-w-sm mx-auto leading-relaxed">
                                    Your message has been safely logged in our correspondence system. A committee liaison will review your query and get back to you shortly.
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wider px-6 py-2.5 hover:border-[#1b3622]/30 transition-colors mt-4"
                                >
                                    Submit Another Query
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {/* Name Input */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                                        Your Full Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Anand Pulazhiyil"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-3 focus:outline-none focus:border-[#1b3622] text-[#2d312e]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Branch Select */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                                            Lineage Branch Segment
                                        </label>
                                        <select
                                            value={branch}
                                            onChange={(e) => setBranch(e.target.value)}
                                            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-3 focus:outline-none focus:border-[#1b3622] text-[#2d312e] h-[42px]"
                                        >
                                            <option value="Vadakke">Vadakke Branch</option>
                                            <option value="Kizhake">Kizhake Branch</option>
                                            <option value="Thekke">Thekke Branch</option>
                                            <option value="Padinjare">Padinjare Branch</option>
                                            <option value="Other">Other / Non-Direct Relation</option>
                                        </select>
                                    </div>

                                    {/* Email Input */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                                            Contact Email *
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="e.g. anand@domain.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-3 focus:outline-none focus:border-[#1b3622] text-[#2d312e]"
                                        />
                                    </div>
                                </div>

                                {/* Subject Input */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                                        Subject / Inquiry Type
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Corrections in Family Tree Record"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-3 focus:outline-none focus:border-[#1b3622] text-[#2d312e]"
                                    />
                                </div>

                                {/* Message Input */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                                        Detailed Message *
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="Describe your inquiry or directory correction details..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-3 focus:outline-none focus:border-[#1b3622] text-[#2d312e] resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isLoading}
                                    type="submit"
                                    className="w-full bg-[#1b3622] text-[#fbf9f4] py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="h-4 w-4 border-2 border-[#fbf9f4] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="h-3.5 w-3.5" />
                                            <span>Transmit Query Logs</span>
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
