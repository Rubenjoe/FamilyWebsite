"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function DashboardSignInPage() {
    const router = useRouter();
    const [memberId, setMemberId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!memberId || !password) {
            setError("Please populate all credential input parameters.");
            return;
        }

        setIsLoading(true);

        // Simulate high-security cryptographic authentication latency
        await new Promise((resolve) => setTimeout(resolve, 1800));

        // Let's implement a simple demo credentials check:
        // Accept any credentials, but log an error if they are ridiculously short
        if (password.length < 4) {
            setIsLoading(false);
            setError("Access denied. The secure pass-key must be at least 4 characters long.");
            return;
        }

        setIsLoading(false);
        // Successful login mock redirect stream
        router.push("/admin");
    };

    return (
        <div className="min-h-[85vh] bg-[#fbf9f4] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
            {/* Ambient Background Graphic Layer */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
                style={{ backgroundImage: "radial-gradient(#1b3622 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full z-0"
                style={{ background: "radial-gradient(circle, #d4af3708 0%, transparent 65%)" }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md bg-white border border-[#1b3622]/10 p-8 shadow-xl relative z-10"
            >
                {/* Gold header accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#d4af37]" />

                {/* Brand Branding Identity Area */}
                <div className="text-center space-y-3 pb-6 border-b border-gray-100 mb-8">
                    <div className="inline-flex h-12 w-12 rounded-full bg-[#1b3622]/5 items-center justify-center border border-[#d4af37]/30 mb-2">
                        <ShieldCheck className="h-6 w-6 text-[#1b3622]" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-[#d4af37] font-bold block">
                            Staff Registry Gate
                        </span>
                        <h1 className="text-2xl font-serif text-[#1b3622] font-normal tracking-wide">
                            Archive Console Access
                        </h1>
                        <p className="text-[11px] text-gray-400 font-light leading-normal max-w-xs mx-auto">
                            Identify yourself with yogam administrative credentials to manage lineage records, timeline epochs, and events.
                        </p>
                    </div>
                </div>

                {/* Form Wrapper */}
                <form onSubmit={handleSignIn} className="space-y-5">
                    
                    {/* Error Banner Container */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 border border-red-200/50 p-3 flex items-start gap-2.5 text-red-700 text-xs font-light leading-relaxed overflow-hidden"
                            >
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Member ID Field */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                            Registry Key ID / Email
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <User className="h-4 w-4 stroke-[1.5]" />
                            </span>
                            <input
                                required
                                type="text"
                                placeholder="e.g. admin@pulazhiyil.org"
                                value={memberId}
                                onChange={(e) => setMemberId(e.target.value)}
                                className="w-full bg-[#fbf9f4] border border-gray-200 text-xs pl-10 pr-4 py-3 focus:outline-none focus:border-[#1b3622] text-[#2d312e]"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                                Security Access Password
                            </label>
                            <button
                                type="button"
                                onClick={() => alert("Administrative access keys can be recovered from the primary parish registrar.")}
                                className="text-[9px] uppercase tracking-wider font-mono text-[#d4af37] hover:text-[#1b3622] transition-colors"
                            >
                                Forgotten?
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock className="h-4 w-4 stroke-[1.5]" />
                            </span>
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter secure key phrase"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#fbf9f4] border border-gray-200 text-xs pl-10 pr-10 py-3 focus:outline-none focus:border-[#1b3622] text-[#2d312e]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 stroke-[1.5]" />
                                ) : (
                                    <Eye className="h-4 w-4 stroke-[1.5]" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Sign-in Button */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-[#1b3622] text-[#fbf9f4] py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                    >
                        {isLoading ? (
                            <div className="h-4 w-4 border-2 border-[#fbf9f4] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Authorize Desk Access</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Explainer / Hint Info box */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400 font-light leading-normal">
                    <span>Pro-tip: For quick local developer evaluation, type any email and a passcode matching/exceeding 4 chars.</span>
                </div>
            </motion.div>
        </div>
    );
}
