interface PositionProps {
    name: string;
    active: boolean;
    onClick: () => void;
}

export default function Position({ name, active, onClick }: PositionProps) {
    return (
        <div
            onClick={onClick}
            className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                active
                    ? "border-primary bg-primary-light"
                    : "border-[var(--color-border)] hover:border-primary"
            }`}
        >
            <span className="text-sm font-medium text-text-primary">{name}</span>
        </div>
    );
}
