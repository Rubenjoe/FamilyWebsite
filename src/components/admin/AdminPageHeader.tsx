interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminPageHeader({ title, subtitle }: AdminPageHeaderProps) {
  return (
    <div className="space-y-1 mb-8">
      <h1 className="text-2xl font-serif text-[#1b3622]">{title}</h1>
      {subtitle && <p className="text-xs text-gray-500 font-light">{subtitle}</p>}
    </div>
  );
}
