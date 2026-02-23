import { useState, useCallback } from 'react';

export default function useExpandable() {
  const [ expandedIds, setExpandedIds ] = useState(new Set());

  const handleToggle = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return [ expandedIds, handleToggle ];
}
