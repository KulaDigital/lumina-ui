interface CardProps {
    title: string;
    children: React.ReactNode;
}

export default function Card({ title, children }: CardProps) {
    return (
        <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-semibold text-text-primary font-heading">
                    {title}
                </h3>
            </div>
            <div className="px-6 py-6 space-y-6">
                {children}
            </div>
        </div>
    );
}
