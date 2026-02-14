import { useState, useCallback } from 'react';

export default function useExpandable() {
  const [ expandedId, setExpandedId ] = useState(null);

  const handleToggle = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  return [ expandedId, handleToggle ];
}
