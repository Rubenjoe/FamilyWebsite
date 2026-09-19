interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminPageHeader({ title, subtitle }: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-0.5 w-8 bg-[#d4af37]" />
        <h1 className="text-2xl md:text-3xl font-serif text-[#1b3622] font-light tracking-tight">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 font-light mt-1.5 pl-11">{subtitle}</p>
      )}
    </div>
  );
}
