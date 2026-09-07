import { useState, useMemo, useEffect } from 'react';

export function useShowMore<T>(items: T[], pageSize = 20) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items.length, pageSize]);

  const visible = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  const showMore = () => {
    setVisibleCount((prev) => prev + pageSize);
  };

  return { visible, hasMore, showMore, visibleCount: visible.length, totalCount: items.length };
}
