interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
