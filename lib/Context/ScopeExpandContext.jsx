import { createContext, useCallback, useMemo, useState } from 'react';

export const ScopeExpandContext = createContext({

  // keeps track of the expanded state of each
  //  scope that are only in the current view
  expandedScopes: {},
  allCollapsed: false,
  setExpanded: () => {},
  registerScope: () => {},
  unregisterScope: () => {},
  collapseAll: () => {},
  expandAll: () => {}
});

export function ScopeExpandProvider({ children }) {
  const [ expandedScopes, setExpandedScopes ] = useState({});

  const registerScope = useCallback((scopeId, defaultExpanded) => {
    setExpandedScopes(prev => {
      if (scopeId in prev) return prev;
      return { ...prev, [scopeId]: defaultExpanded };
    });
  }, []);

  const unregisterScope = useCallback((scopeId) => {
    setExpandedScopes(prev => {
      if (!(scopeId in prev)) return prev;
      const { [scopeId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const setExpanded = useCallback((scopeId, value) => {
    setExpandedScopes(prev => ({ ...prev, [scopeId]: value }));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedScopes(prev =>
      Object.fromEntries(Object.keys(prev).map(id => [ id, false ]))
    );
  }, []);

  const expandAll = useCallback(() => {
    setExpandedScopes(prev =>
      Object.fromEntries(Object.keys(prev).map(id => [ id, true ]))
    );
  }, []);

  const scopeIds = Object.keys(expandedScopes);
  const allCollapsed = scopeIds.length > 0 &&
    scopeIds.every(id => expandedScopes[id] === false);

  const value = useMemo(() => ({
    expandedScopes,
    allCollapsed,
    setExpanded,
    registerScope,
    unregisterScope,
    collapseAll,
    expandAll
  }), [ expandedScopes, allCollapsed, setExpanded, registerScope, unregisterScope, collapseAll, expandAll ]);

  return (
    <ScopeExpandContext.Provider value={ value }>
      { children }
    </ScopeExpandContext.Provider>
  );
}
