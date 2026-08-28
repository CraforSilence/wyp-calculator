interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ children, className = '', title, hoverable = false }: CardProps) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg animate-fade-in-up ${hoverable ? 'hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20 transition-[border-color,box-shadow] duration-200 cursor-pointer' : ''} ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
