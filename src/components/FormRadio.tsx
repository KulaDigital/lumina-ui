interface RadioProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

export default function Radio({ label, active, onClick }: RadioProps) {
    return (
        <div
            onClick={onClick}
            className={`border rounded-md p-3 cursor-pointer flex gap-3 transition-all ${
                active ? "border-primary bg-primary-light" : "border-[var(--color-border)] hover:border-primary"
            }`}
        >
            <div
                className={`w-4 h-4 rounded-full border flex-shrink-0 ${
                    active ? "bg-primary border-primary" : "border-[var(--color-border)]"
                }`}
            />
            <span className="text-sm text-text-primary">{label}</span>
        </div>
    );
}
