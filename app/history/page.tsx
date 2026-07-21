import { BookOpen, Shield, Users, Award } from "lucide-react";

export default function HistoryPage() {
    const CORE_VALUES = [
        {
            icon: <Shield className="h-5 w-5 text-[#d4af37]" />,
            title: "Roots & Integrity",
            desc: "Honoring the legacy, lands, and values passed down by our founding elders through persistent historical preservation."
        },
        {
            icon: <Users className="h-5 w-5 text-[#d4af37]" />,
            title: "Unbroken Unity",
            desc: "Bridging geographical divides across the global diaspora to ensure our kinship remains closely knit and collaborative."
        },
        {
            icon: <Award className="h-5 w-5 text-[#d4af37]" />,
            title: "Generational Legacy",
            desc: "Equipping the youth of today with deep knowledge of their lineage to empower their futures with identity and grace."
        }
    ];

    return (
        <div className="pb-24">

            {/* Editorial Header */}
            <section className="bg-white border-b border-[#1b3622]/5 py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-semibold block">The Family Chronicles</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#1b3622] font-normal">Our Deep-Rooted Heritage</h1>
                    <p className="text-gray-500 font-light max-w-xl mx-auto text-sm leading-relaxed">
                        An exploration of the traditions, resilience, and growth that defined the Pulazhiyil family through a changing century.
                    </p>
                </div>
            </section>

            {/* Main Historical Layout */}
            <section className="max-w-4xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

                {/* Core Narrative Body */}
                <div className="md:col-span-8 space-y-8 text-gray-600 font-light leading-relaxed text-sm">
                    <p className="text-base text-[#1b3622] font-normal leading-relaxed">
                        The narrative of the Pulazhiyil Kudumbayogam is fundamentally tied to the agricultural heartlands of Thrissur, Kerala. Originating as local leaders and land cultivators, our ancestors constructed a legacy founded on profound social responsibility and community integration.
                    </p>

                    <h2 className="text-xl font-serif text-[#1b3622] font-medium pt-4 border-b border-gray-100 pb-2">The Early Dawn (1920s - 1950s)</h2>
                    <p>
                        In the early decades of the twentieth century, the founding patriarchs recognized that physical distance between expanding branches could compromise traditional kinship links. They established formal family councils, setting rules to support members in education, business, and heritage preservation.
                    </p>

                    <h2 className="text-xl font-serif text-[#1b3622] font-medium pt-4 border-b border-gray-100 pb-2">Institutionalization of the Kudumbayogam</h2>
                    <p>
                        By 1952, the assemblies evolved into a formal organization. Regular administrative minutes were kept, properties were cataloged, and collective welfare funds were structured. This organization ensured that regardless of global migrations, every relative retained an immutable anchor point back to the ancestral tharavadu.
                    </p>
                </div>

                {/* Sidebar Virtue Grid */}
                <div className="md:col-span-4 bg-white border border-[#1b3622]/10 p-6 space-y-6 sticky top-28">
                    <div className="flex items-center gap-2 text-[#1b3622] border-b border-gray-100 pb-3">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-widest font-bold">Our Pillars</span>
                    </div>

                    {CORE_VALUES.map((value, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                {value.icon}
                                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#2d312e]">{value.title}</h3>
                            </div>
                            <p className="text-xs text-gray-500 font-light leading-relaxed pl-7">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}