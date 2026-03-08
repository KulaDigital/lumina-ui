interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

export default function Input({ label, value, onChange, required }: InputProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
                {label} {required && <span className="text-[var(--color-error)]">*</span>}
            </label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
        </div>
    );
}
