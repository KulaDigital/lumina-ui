interface PlanCardProps {
    name: string;
    active: boolean;
    onClick: () => void;
}

export default function PlanCard({ name, active, onClick }: PlanCardProps) {
    return (
        <div
            onClick={onClick}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                active
                    ? "border-primary bg-primary-light"
                    : "border-[var(--color-border)] hover:border-primary"
            }`}
        >
            <h3 className="font-semibold text-sm capitalize text-text-primary">{name}</h3>
        </div>
    );
}
