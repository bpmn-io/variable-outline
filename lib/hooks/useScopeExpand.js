import { useContext, useCallback, useEffect } from 'react';

import { ScopeExpandContext } from '../Context/ScopeExpandContext';

export default function useScopeExpand(scopeId, defaultExpanded = true) {
  const {
    expandedScopes,
    setExpanded,
    registerScope,
    unregisterScope
  } = useContext(ScopeExpandContext);

  useEffect(() => {
    registerScope(scopeId, defaultExpanded);

    return () => unregisterScope(scopeId);
  }, [ scopeId, defaultExpanded, registerScope, unregisterScope ]);

  const expanded = scopeId in expandedScopes
    ? expandedScopes[scopeId]
    : defaultExpanded;

  const toggle = useCallback(() => {
    setExpanded(scopeId, !expanded);
  }, [ scopeId, expanded, setExpanded ]);

  return [ expanded, toggle ];
}
