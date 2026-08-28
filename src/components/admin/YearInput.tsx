interface YearInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function YearInput({ label, value, onChange, placeholder = "YYYY", required }: YearInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
      />
    </div>
  );
}
