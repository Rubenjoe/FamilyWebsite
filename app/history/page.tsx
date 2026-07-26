"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Anchor, 
  Compass, 
  Shield, 
  Users, 
  BookOpen, 
  Calendar, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  Bookmark,
  MapPin
} from "lucide-react";

// ─── Data Definitions ────────────────────────────────────────────────────────

interface HistorySection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  intro: string;
  fullText: string[];
  image: string;
  alt: string;
}

const HISTORY_SECTIONS: HistorySection[] = [
  {
    id: "roots",
    title: "Our Roots",
    icon: Anchor,
    intro: "The Pullazhiyil family is one of the seventy-two Knanaya families who, according to Knanaya tradition, arrived at the historic port of Kodungalloor in Kerala in <span class='highlight-date'>A.D. 345</span>, under the leadership of the renowned Jewish Christian merchant <span class='highlight-name'>Knai Thoma</span>.",
    fullText: [
      "Knanaya tradition holds that approximately 400 Jewish Christians belonging to seventy-two families from seven clans migrated to Kerala, carrying with them their faith, culture, traditions, and distinctive way of life. This historic migration laid a strong foundation for the heritage and identity of the Knanaya community in Kerala.",
      "To distinguish themselves from the local Christians who traced their faith to St. Thomas the Apostle, our ancestors came to be known as the <span class='italic font-serif font-medium text-[#1b3622]'>Thekkumbhagar</span>, while the local Marthoman Christians were known as the <span class='italic font-serif font-medium text-[#1b3622]'>Vadakkumbhagar</span>.",
      "Through the centuries, the Knanaya community faithfully preserved its Jewish-Christian heritage, customs, faith traditions, and family values. The practice of <span class='font-semibold text-[#1b3622]'>endogamy—marriage within the community—</span>also played an important role in preserving its distinctive identity across generations."
    ],
    image: "/images/history_roots.png",
    alt: "Arrival of Knai Thoma and Knanaya families at Kodungalloor Port in A.D. 345"
  },
  {
    id: "migration",
    title: "Migration to Iruvallipra",
    icon: Compass,
    intro: "During the <span class='highlight-date'>eighteenth century</span>, the invasion of <span class='highlight-name'>Tipu Sultan</span> created significant challenges for Christian communities in Kerala. In search of safety and freedom to practise their faith, many families were compelled to migrate southward.",
    fullText: [
      "Rivers, which served as important routes of transportation during that period, became the pathways of this long journey. Many of these migrating families eventually settled in places such as Kottayam, Chingavanam, Upper Kuttanad, Veliyanadu, Kallissery, Ranny, and surrounding regions.",
      "Family tradition holds that a section of our ancestors travelled eastward along the banks of the <span class='highlight-name'>Manimala River</span> and eventually settled at <span class='highlight-name'>Iruvallipra</span>, near Thiruvalla. The natural beauty of the region and its fertile agricultural land encouraged them to make Iruvallipra their permanent home.",
      "It was here that our family came to be known by the ancestral house name <span class='highlight-name'>&quot;Pullazhiyil.&quot;</span> Generations have passed, yet this name continues to stand as an enduring symbol of our family's heritage and pride."
    ],
    image: "/images/history_migration.png",
    alt: "Migration pathway along Manimala River to Iruvallipra"
  },
  {
    id: "emergence",
    title: "The Emergence of the Pullazhiyil Family",
    icon: Shield,
    intro: "The foundation of the Pullazhiyil family at Iruvallipra was laid by our respected ancestor, <span class='highlight-name'>Sri. Kuriyala</span>. He had four sons and daughters, and through his children emerged the four principal branches of the family that we know today.",
    fullText: [
      "His eldest son, <span class='highlight-name'>Sri. Itty Kuriyala</span>, married and continued to live with his parents at Iruvallipra, carrying forward the traditions of the ancestral Pullazhiyil household.",
      "As agriculture was the principal means of livelihood during that period, the other sons gradually moved to fertile lands in nearby areas and established their own households.",
      "<span class='highlight-name'>Sri. Kuriyala Kurian</span> migrated to Thiruvanvandoor and adopted the family name <span class='font-semibold text-[#1b3622]'>Thykurinjiyil</span>, thereby establishing the Thykurinjiyil branch. As generations passed, this branch flourished and further developed into the <span class='font-medium'>Thykurinjiyil–Thoppil</span> and <span class='font-medium'>Thykurinjiyil–Kolupra</span> sub-branches. Both continue to proudly preserve the heritage, traditions, and values inherited from their common ancestors.",
      "<span class='highlight-name'>Sri. Chacko Kuriyala</span> remained at Iruvallipra, where he established the <span class='font-semibold text-[#1b3622]'>Thanuvelil</span> branch of the family. His son, <span class='highlight-name'>Sri. Itty</span>, later relocated to Meenthalakkara, while retaining the Thanuvelil family name. Over successive generations, this branch further expanded into the <span class='font-medium'>Thanuvelil–Madathil</span> and <span class='font-medium'>Thanuvelil–Thaiparambil</span> sub-branches, carrying forward and enriching the family's heritage.",
      "The youngest son, <span class='highlight-name'>Sri. Itty Kuriyala</span>, adopted the family name <span class='font-semibold text-[#1b3622]'>Poovathumparambil</span> and continued to reside at Iruvallipra. His descendants carried forward the faith and family values inherited from their forefathers and contributed to the growth of the family lineage.",
      "Thus, from one ancestral family emerged four principal branches—<span class='highlight-name'>Pullazhiyil</span>, <span class='highlight-name'>Thykurinjiyil</span>, <span class='highlight-name'>Thanuvelil</span>, and <span class='highlight-name'>Poovathumparambil</span>. Though generations have passed and the branches have spread far and wide, they continue to remain inseparable parts of one family, growing from the same ancestral roots."
    ],
    image: "/images/history_emergence.png",
    alt: "Emergence of the four principal branches from ancestor Sri. Kuriyala"
  },
  {
    id: "expansion",
    title: "Growth and Expansion",
    icon: Users,
    intro: "Over the generations, the Pullazhiyil family continued to grow, with members settling in different parts of Kerala. Family members established their homes in Iruvallipra, Meenthalakkara, Vallamkulam, Venpala, Ramamangalam, Gurunathanmannu, Vechoochira, Rajapuram, Thiruvanvandoor, Chingavanam, Kurichy, Kottayam, and several other places.",
    fullText: [
      "With changing times and expanding opportunities in education, employment, and business, members of the family gradually moved beyond Kerala to other parts of India and, eventually, across the world. Today, members of the Pullazhiyil family live in the United States, Australia, various European countries, and many other parts of the world, making meaningful contributions in diverse fields.",
      "Although geographical distances have grown, the bonds between our hearts have never diminished. Wherever we may live, we remain united by our common ancestry, Knanaya heritage, faith, and family bonds. These enduring ties continue to be the greatest strength that holds our family together across generations."
    ],
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
    alt: "Nostalgic family gathering illustrating growth and global expansion"
  },
  {
    id: "formation",
    title: "Formation of the Kudumbayogam",
    icon: BookOpen,
    intro: "Our visionary forefathers recognised, well ahead of their time, the importance of maintaining close relationships among family members who had settled in different parts of Kerala. They understood that geographical distance should never weaken family bonds.",
    fullText: [
      "It was this farsighted vision that led to the formation of the <span class='highlight-name'>Pullazhiyil Kudumbayogam</span>. The Kudumbayogam became a meaningful platform for fostering love and unity among family members, maintaining relationships across different branches, and connecting younger generations with their ancestral roots.",
      "Unfortunately, during the Great Flood in the early twentieth century, many of the early records and historical documents of the Kudumbayogam were lost. Consequently, much of what is known about this early period has been preserved through the oral traditions handed down by our forefathers from generation to generation.",
      "Available information indicates that the Pullazhiyil Kudumbayogam was actively functioning during the <span class='highlight-date'>1940s</span>. The known early office bearers were: <br/>• <strong>Patron:</strong> <span class='highlight-name'>Sri. Poovathumparambil Itty Kuruvilla</span><br/>• <strong>Secretary:</strong> <span class='highlight-name'>Sri. Thykurinjiyil Kuriyala</span>",
      "The last meeting of the original Kudumbayogam was held in <span class='highlight-date'>1951</span> at the residence of <span class='highlight-name'>Sri. Thanuvelil Chacko</span>. Thereafter, owing to various circumstances, the formal activities of the Kudumbayogam remained dormant for several decades.",
      "Nevertheless, the bonds among family members were never lost. Even during the years when the Kudumbayogam was inactive, family unity continued through marriages, family gatherings, faith, and social relationships. These enduring bonds eventually became the foundation for the revival of the Kudumbayogam."
    ],
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
    alt: "Vintage pen and records book representing early 1940s Kudumbayogam assemblies"
  },
  {
    id: "revival",
    title: "Revival of the Kudumbayogam",
    icon: Calendar,
    intro: "Although the years passed, the affection and sense of belonging among members of the Pullazhiyil family never faded. With family members increasingly moving overseas, there arose a renewed need to strengthen family connections and pass on the family's heritage in <span class='highlight-date'>1998</span>.",
    fullText: [
      "On <span class='highlight-date'>11 July 1998</span>, a historic gathering was held at the residence of <span class='highlight-name'>Sri. Thykurinjiyil T. I. Kuruvilla (Pappachan)</span>. This meeting marked the beginning of a new chapter in the history of the Kudumbayogam. A formal constitution was adopted, providing a clear direction for its future activities.",
      "Initially, the revived organisation functioned under the name <span class='font-medium'>Pullazhiyil–Thykurinjiyil Kudumbayogam</span>. As it expanded to embrace all branches of the family, the name was subsequently changed to <span class='font-medium'>Pullazhiyil–Thykurinjiyil–Thanuvelil–Poovathumparambil Kudumbayogam</span>. Eventually, a name representing the common identity of all branches was adopted—<span class='highlight-name'>Pullazhiyil Kudumbayogam</span>.",
      "Since its revival, the Kudumbayogam has continued to strengthen family relationships through annual family gatherings, spiritual programmes, cultural celebrations, charitable initiatives, and activities involving children and younger generations. Through these efforts, our heritage and family values continue to be passed on from one generation to the next."
    ],
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=800",
    alt: "Historic gathering in 1998 marking the revival of Pullazhiyil Kudumbayogam"
  },
  {
    id: "journey",
    title: "Our Journey Continues",
    icon: Heart,
    intro: "The greatness of a family is measured not merely by its wealth or the number of its members, but by the faith, love, unity, and sense of heritage that bind generations together. The history of the Pullazhiyil family is a story of faith, family unity, sacrifice, and tradition flowing through the centuries.",
    fullText: [
      "The greatest inheritance entrusted to us by our forefathers is not land or material wealth, but the family values that taught us to love one another, remain united, and stand together.",
      "Today, every member of the family living in different parts of the world is a living link in this great chain of heritage. Continents may separate us, but our roots remain one. That is our strength and our pride.",
      "Preserving this precious heritage, strengthening the bonds among family members, and connecting younger generations with their ancestral roots remain at the heart of the mission of the Pullazhiyil Kudumbayogam.",
      "It is the proud responsibility of every member of our family to preserve the faith, culture, love, and family values entrusted to us by our ancestors and to pass them on, with the same devotion and dignity, to generations yet to come."
    ],
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800",
    alt: "Majestic ancient tree representing deep family roots and continuous generational growth"
  }
];

const POETIC_VERSES = [
  "Times may change...",
  "Generations may change...",
  "The circumstances of our lives may change...",
  "But the heritage, faith, and family bonds of the Pullazhiyil family will endure.",
  "Wherever we may live...",
  "Whatever country we may call home...",
  "Whatever generation we may belong to...",
  "Our roots are one... Our heritage is one... Our family is one.",
  "May the abundant blessings of Almighty God and the prayers of our forefathers preserve the faith, unity, and heritage of the Pullazhiyil family for generations to come.",
  "May God abundantly bless the Pullazhiyil family and every member of our extended family."
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const NORELL_EASE = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="bg-[#fbf9f4] bg-parchment text-[#1b3622] min-h-screen pb-24 selection:bg-[#1b3622] selection:text-[#fbf9f4] relative overflow-x-hidden">
      
      {/* Elegant Ambient Background Glows */}
      <div className="absolute top-[10%] left-[-15%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[#d4af37]/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[50%] right-[-15%] w-[350px] md:w-[700px] h-[350px] md:h-[700px] rounded-full bg-[#1b3622]/4 blur-[90px] md:blur-[180px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[#d4af37]/4 blur-[80px] md:blur-[140px] pointer-events-none z-0" />

      {/* Editorial Header */}
      <section className="relative z-10 py-24 px-6 border-b border-[#1b3622]/10 bg-white/40 backdrop-blur-[2px]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: NORELL_EASE }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#1b3622]/5 border border-[#1b3622]/10 rounded-full"
          >
            <Bookmark className="h-3.5 w-3.5 text-[#d4af37]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#1b3622] font-semibold font-mono">
              The Family Chronicles
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.15, ease: NORELL_EASE }}
            className="text-4xl md:text-6xl font-light font-serif tracking-tight leading-tight text-[#1b3622]"
          >
            A Proud Legacy of Heritage
          </motion.h1>

          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: NORELL_EASE }}
            className="w-24 h-0.5 bg-[#d4af37] mx-auto"
          />

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="text-[#2d312e]/70 font-light max-w-xl mx-auto text-sm md:text-base leading-relaxed"
          >
            Trace the centuries-old narrative, migration routes, and institutional growth that bind the branches of the Pullazhiyil family together.
          </motion.p>
        </div>
      </section>

      {/* Main Historical Timeline Sections */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-20 space-y-24 md:space-y-36">
        {HISTORY_SECTIONS.map((section, index) => {
          const IconComponent = section.icon;
          const isExpanded = !!expandedSections[section.id];
          const isEven = index % 2 === 1;

          // Around the middle of the History page (e.g. before Section 4: Growth and Expansion, which is index 3)
          // We render the full-width feature image.
          const showFeatureImage = index === 3;

          return (
            <div key={section.id} className="space-y-24 md:space-y-36">
              
              {/* Conditional full-width Feature Image before section 4 */}
              {showFeatureImage && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.2, ease: NORELL_EASE }}
                  className="w-full space-y-4"
                >
                  <div className="relative h-[300px] sm:h-[450px] md:h-[550px] w-full overflow-hidden shadow-2xl rounded-2xl group border border-[#1b3622]/15">
                    {/* Background tint overlay */}
                    <div className="absolute inset-0 bg-[#1b3622]/10 z-10 transition-opacity duration-500 group-hover:opacity-0" />
                    
                    <motion.img 
                      whileHover={{ scale: 1.025 }}
                      transition={{ duration: 0.8 }}
                      src="https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&q=80&w=1200" 
                      alt="Traditional Kerala landscape and river channels" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center max-w-xl mx-auto">
                    <p className="text-xs italic font-serif text-[#1b3622]/70 leading-relaxed">
                      The serene waterways of Central Kerala, symbolizing the natural pathways that guided our ancestors through generation-defining migrations.
                    </p>
                    <div className="w-12 h-px bg-[#d4af37]/35 mx-auto mt-2" />
                  </div>
                </motion.div>
              )}

              {/* Standard Section Block */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                
                {/* Text Block */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? 25 : -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, delay: 0.1, ease: NORELL_EASE }}
                  className={`lg:col-span-7 space-y-6 ${
                    isEven ? "order-2 lg:order-2" : "order-2 lg:order-1"
                  }`}
                >
                  {/* Section Label */}
                  <div className="flex items-center gap-3 text-[#d4af37]">
                    <div className="p-2 bg-[#1b3622]/5 rounded-lg border border-[#1b3622]/10">
                      <IconComponent className="h-5 w-5 text-[#d4af37] stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] tracking-[0.25em] uppercase font-mono font-bold">
                      Section {index + 1}
                    </span>
                  </div>

                  {/* Heading */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-light font-serif text-[#1b3622] leading-tight">
                    {section.title}
                  </h2>

                  {/* Divider line */}
                  <div className="w-16 h-0.5 bg-[#d4af37]/40" />

                  {/* Intro Text */}
                  <p 
                    className="text-gray-700 font-light text-sm sm:text-base leading-relaxed dropcap"
                    dangerouslySetInnerHTML={{ __html: section.intro }}
                  />

                  {/* Expandable Read More Content */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: NORELL_EASE }}
                        className="overflow-hidden space-y-4 text-gray-600 font-light text-sm leading-relaxed border-t border-gray-100/60 pt-4"
                      >
                        {section.fullText.map((paragraph, pIdx) => (
                          <p 
                            key={pIdx} 
                            dangerouslySetInnerHTML={{ __html: paragraph }}
                            className="transition-colors hover:text-gray-900"
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Accordion Trigger Button */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="group inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase font-bold text-[#d4af37] hover:text-[#1b3622] transition-colors duration-300 pt-2 cursor-pointer select-none"
                  >
                    <span>{isExpanded ? "Read Less" : "Read More"}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover:-translate-y-0.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover:translate-y-0.5" />
                    )}
                  </button>

                </motion.div>

                {/* Image Block */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, delay: 0.15, ease: NORELL_EASE }}
                  className={`lg:col-span-5 w-full ${
                    isEven ? "order-1 lg:order-1" : "order-1 lg:order-2"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-500 border border-[#1b3622]/10 group aspect-[4/3] w-full">
                    {/* Ambient image vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none" />
                    <motion.img 
                      whileHover={{ scale: 1.04 }}
                      transition={{ duration: 0.6 }}
                      src={section.image} 
                      alt={section.alt} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

              </div>
            </div>
          );
        })}
      </section>

      {/* Poetic & Epilogue Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-32 md:mt-48 text-center space-y-16">
        
        <div className="w-32 h-px bg-[#d4af37]/35 mx-auto" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: NORELL_EASE }}
          className="bg-white/40 border border-[#1b3622]/10 p-8 sm:p-12 rounded-2xl shadow-sm space-y-8 backdrop-blur-[2px]"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#d4af37] block font-semibold">
            The Eternal Covenant
          </span>

          <div className="space-y-6">
            {POETIC_VERSES.map((verse, vIdx) => {
              // Highlight tagline or bold lines
              const isTagline = verse.includes("Rooted in Heritage");
              const isEmphasized = verse.includes("Our roots are one") || verse.includes("will endure");
              
              return (
                <motion.p
                  key={vIdx}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: vIdx * 0.08 }}
                  className={`text-[#1b3622] leading-relaxed ${
                    isTagline 
                      ? "text-lg sm:text-xl font-bold font-serif tracking-wide border-t border-b border-[#d4af37]/25 py-4 max-w-md mx-auto italic" 
                      : isEmphasized
                        ? "text-sm sm:text-base font-medium font-serif italic"
                        : "text-xs sm:text-sm font-light"
                  }`}
                >
                  {verse}
                </motion.p>
              );
            })}
          </div>

        </motion.div>

      </section>

    </div>
  );
}