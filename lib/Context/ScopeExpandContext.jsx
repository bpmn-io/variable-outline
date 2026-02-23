import { createContext, useCallback, useMemo, useState } from 'react';

export const ScopeExpandContext = createContext({
  expandedScopes: {},
  setExpanded: () => {},
  registerScope: () => {},
  collapseAll: () => {}
});

export function ScopeExpandProvider({ children }) {
  const [ expandedScopes, setExpandedScopes ] = useState({});

  const registerScope = useCallback((scopeId, defaultExpanded) => {
    setExpandedScopes(prev => {
      if (scopeId in prev) return prev;
      return { ...prev, [scopeId]: defaultExpanded };
    });
  }, []);

  const setExpanded = useCallback((scopeId, value) => {
    setExpandedScopes(prev => ({ ...prev, [scopeId]: value }));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedScopes(prev =>
      Object.fromEntries(Object.keys(prev).map(key => [ key, false ]))
    );
  }, []);

  const value = useMemo(() => ({
    expandedScopes,
    setExpanded,
    registerScope,
    collapseAll
  }), [ expandedScopes, setExpanded, registerScope, collapseAll ]);

  return (
    <ScopeExpandContext.Provider value={ value }>
      { children }
    </ScopeExpandContext.Provider>
  );
}
