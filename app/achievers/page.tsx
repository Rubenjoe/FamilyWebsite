"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import LightboxImage from "@/components/ui/LightboxImage";
import { createClient } from "@/utils/supabase/client";

const NORELL_EASE = [0.16, 1, 0.3, 1] as const;

const ACHIEVEMENTS = [
  {
    id: "ac1",
    name: "Lt. Cdr Kuriakose Mathew (Aniyan)",
    branch: "Thanuvelil",
    year: "1971",
    title: "First Commissioned Officer of Indian Navy",
    description:
      "First Commissioned Officer of Indian Navy from Thanuvelil family. Participated in 1971 Indo-Pak war on board Aircraft Carrier INS VIKRANT.",
    image: "/achv/Lt. Cdr Kuriakose Mathew(Aniyan). .jpeg",
  },
  {
    id: "ac-tc-thomas",
    name: "TC Thomas Thykurinjiyil-Thoppil",
    branch: "Thykurinjiyil",
    year: "Honored",
    title: "Trustee - Knanaya Samudayam",
    description:
      "Served as the Trustee of the Knanaya Samudayam, bringing distinction and honor to the Thykurinjiyil-Thoppil branch.",
    image: "/achv/TC Thomas.jpeg",
  },
  {
    id: "ac2",
    name: "Siby Mathew Thanuvelil",
    branch: "Thanuvelil",
    year: "Present",
    title: "Director at AbbVie & IIM Alumnus",
    description:
      "An IIM Alumni. Now Director of a USA based MNC Abbvie. S/o Lt. Cdr. Kuriakose Mathew.",
    image: "/achv/Siby Mathew Thanuvelil. An IIM Alumni.jpeg",
  },
  {
    id: "ac-susan-thomas",
    name: "Dr. Susan Thomas, Thyparampil",
    branch: "Thyparampil",
    year: "Honored",
    title: "Ph.D. in Photonics",
    description: "Awarded a Ph.D. in Photonics from the Indian Institute of Technology (IIT) Madras.",
    image: "/achv/Dr.Susan Thomas,Thyparampil.jpeg",
  },
  {
    id: "ac-kurian-molikutty",
    name: "T. K. Kurian & Molikutty Kurian",
    branch: "Knanaya Samudhayam",
    year: "Ordained",
    title: "Evangelists of the Knanaya Samudhayam",
    description: "Ordained as Evangelists of the Knanaya Samudhayam, in recognition of their life of faith and service.",
    image: "/achv/T. K. Kurian and Molikutty Kurian.jpeg",
  },
  {
    id: "ac3",
    name: "Submit an Achievement",
    branch: "All Branches",
    year: "Ongoing",
    title: "Recognize Excellence",
    description:
      "Have you or a family member achieved a milestone, received an award, or made a notable contribution? Let the Kudumbayogam know so we can celebrate and register it here.",
    image: "",
  },
];

const EVANGELISTS = [
  {
    id: "ev-tt-thomas",
    name: "T. T. Thomas Thanuvelil",
    branch: "Thanuvelil",
    year: "Present",
    title: "Centre Pastor, IPC Pampakuda Centre",
    description: "Serving as Centre Pastor at IPC Pampakuda Centre.",
    image: "/Evangilist/TT Thomas Thanuvelil.jpeg",
  },
  {
    id: "ev1",
    name: "Fr. Thomas Pullazhiyil",
    branch: "Pullazhiyil",
    year: "1965",
    title: "Pioneer Missionary Priest",
    description:
      "Dedicated decades of priestly service across Kerala and abroad, establishing missions and spreading the Gospel rooted in the Knanaya tradition.",
    image: "",
  },
  {
    id: "ev2",
    name: "Sr. Mary Thykurinjiyil",
    branch: "Thykurinjiyil",
    year: "1978",
    title: "Religious Sister & Educator",
    description:
      "Founded a charitable school for underprivileged children in rural Kerala, serving as principal for over 30 years and inspiring generations of students.",
    image: "",
  },
  {
    id: "ev3",
    name: "Deacon Jose Thanuvelil",
    branch: "Thanuvelil",
    year: "2005",
    title: "Ordained Deacon & Community Servant",
    description:
      "Faithfully served the parish community as an ordained deacon, leading family prayer movements and charitable outreach across the diocese.",
    image: "",
  },
  {
    id: "ev4",
    name: "Submit an Evangelist",
    branch: "All Branches",
    year: "Ongoing",
    title: "Honour Their Faith",
    description:
      "Know a family member who has dedicated their life to faith and service? Submit their story to be celebrated and remembered in the Pullazhiyil Heritage Registry.",
    image: "",
  },
];

type Tab = "achievers" | "evangelists";

function AchieversContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "achievers";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [records, setRecords] = useState({ achievers: ACHIEVEMENTS, evangelists: EVANGELISTS });
  useEffect(() => {
    createClient().from("heritage_records").select("id,kind,name,branch,title,description,image_url,year_label").in("kind", ["achiever", "evangelist"]).eq("is_published", true).order("sort_order").then(({ data }) => {
      if (!data) return;
      const map = (kind: "achiever" | "evangelist") => data.filter((row) => row.kind === kind).map((row) => ({ id: row.id, name: row.name, branch: row.branch, title: row.title || "", description: row.description || "", image: row.image_url || "", year: row.year_label || "" }));
      setRecords({ achievers: map("achiever"), evangelists: map("evangelist") });
    });
  }, []);

  const items = activeTab === "achievers" ? records.achievers : records.evangelists;

  return (
    <div className="bg-[#fbf9f4] text-[#1b3622] min-h-screen selection:bg-[#1b3622] selection:text-[#fbf9f4]">
      {/* Ambient glows */}
      <div className="fixed top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#d4af37]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1b3622]/4 blur-[140px] pointer-events-none z-0" />

      {/* ── Page Header ── */}
      <div className="relative bg-[#1b3622] text-[#fbf9f4] px-6 md:px-12 lg:px-20 pt-20 pb-16 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(#d4af37 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#d4af37]/90 hover:text-[#d4af37] text-xs uppercase tracking-[0.18em] font-mono font-bold transition-colors duration-200 mb-8 group"
          >
            <ArrowRight className="h-3 w-3 rotate-180 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: NORELL_EASE }}
            className="space-y-4"
          >
            <span className="text-xs uppercase tracking-[0.22em] font-mono text-[#d4af37] block">
              Pullazhiyil Heritage Registry
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-light leading-tight">
              {activeTab === "achievers" ? "Family Achievers" : "Family Evangelists"}
            </h1>
            <p className="text-[#fbf9f4]/85 font-normal text-base md:text-lg max-w-xl leading-relaxed">
              {activeTab === "achievers"
                ? "Honoring the remarkable accomplishments of the Pullazhiyil Kudumbayogam across generations."
                : "Celebrating those who have dedicated their lives to faith, service, and the Gospel across generations."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-12">
        <div className="flex gap-0 border border-[#1b3622]/15 w-fit">
          {(["achievers", "evangelists"] as Tab[]).map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold transition-all duration-300 ${activeTab === tab
                  ? "bg-[#1b3622] text-[#fbf9f4]"
                  : "bg-transparent text-[#1b3622]/60 hover:text-[#1b3622] hover:bg-[#1b3622]/5"
                }`}
            >
              <span className="flex items-center gap-2">
                {tab === "achievers" ? (
                  <Award className="h-3 w-3" />
                ) : (
                  <Users className="h-3 w-3" />
                )}
                {tab === "achievers" ? "Achievers" : "Evangelists"}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full h-px bg-[#1b3622]/10 mt-8 mb-12" />

        {/* ── Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: NORELL_EASE }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.09,
                  ease: NORELL_EASE,
                }}
                className="bg-white border border-[#1b3622]/10 p-6 flex flex-col justify-between space-y-5 shadow-sm group hover:shadow-md transition-all duration-500 rounded-sm"
              >
                {/* Photo frame */}
                <div className="aspect-[3/4] w-full bg-[#fbf9f4] border border-dashed border-[#1b3622]/20 flex flex-col items-center justify-center text-center relative overflow-hidden group-hover:border-[#d4af37]/45 transition-colors duration-500 rounded-sm">
                  {item.image ? (
                    <LightboxImage
                      src={item.image}
                      alt={item.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                      {activeTab === "achievers" ? (
                        <Award className="h-10 w-10 text-[#d4af37] stroke-[1] mb-3 opacity-60 group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Users className="h-10 w-10 text-[#d4af37] stroke-[1] mb-3 opacity-60 group-hover:scale-110 transition-transform duration-500" />
                      )}
                      <span className="text-xs uppercase tracking-[0.12em] font-mono text-[#1b3622]/70 font-bold block mb-1">
                        Photo Placeholder
                      </span>
                      <span className="text-xs text-[#1b3622]/60 font-normal block">
                        Awaiting portrait or recognition image
                      </span>
                    </div>
                  )}
                  {/* Corner decorations */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#1b3622]/20" />
                  <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#1b3622]/20" />
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#1b3622]/20" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#1b3622]/20" />
                </div>

                {/* Info */}
                <div className="space-y-3 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="bg-[#1b3622]/5 text-[#1b3622] text-xs uppercase tracking-[0.1em] font-bold px-2 py-1 border border-[#1b3622]/10">
                        {item.branch} Branch
                      </span>
                      <span className="text-gray-500 font-mono text-[10px]">
                        {item.year}
                      </span>
                    </div>
                    <h3 className="text-xl text-[#1b3622] font-serif font-medium leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-sm uppercase tracking-[0.1em] text-[#a57f12] font-semibold font-mono">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-600 font-normal leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 pt-3 border-t border-gray-100">
                    Pulazhiyil Excellence Registry
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AchieversPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fbf9f4] flex items-center justify-center">
        <div className="text-[#1b3622]/60 font-mono text-sm uppercase tracking-[0.15em]">Loading...</div>
      </div>
    }>
      <AchieversContent />
    </Suspense>
  );
}
