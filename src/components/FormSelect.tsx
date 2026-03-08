interface SelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    required?: boolean;
}

export default function Select({ label, value, onChange, options, required = false }: SelectProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="w-full border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
                <option value="">Select</option>
                {options.map((o: string) => (
                    <option key={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}
