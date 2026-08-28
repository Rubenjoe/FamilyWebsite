interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function DateInput({ label, value, onChange, required }: DateInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
      />
    </div>
  );
}
