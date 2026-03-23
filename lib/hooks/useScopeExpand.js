import { useContext, useCallback, useEffect } from 'react';

import { ScopeExpandContext } from '../context/ScopeExpandContext';
import useTracking from './useTracking';

export default function useScopeExpand(scopeId, defaultExpanded = true) {
  const {
    expandedScopes,
    setExpanded,
    registerScope,
    unregisterScope
  } = useContext(ScopeExpandContext);

  const track = useTracking();

  useEffect(() => {
    registerScope(scopeId, defaultExpanded);

    return () => unregisterScope(scopeId);
  }, [ scopeId, defaultExpanded, registerScope, unregisterScope ]);

  const expanded = scopeId in expandedScopes
    ? expandedScopes[scopeId]
    : defaultExpanded;

  const toggle = useCallback(() => {
    const willExpand = !expanded;
    setExpanded(scopeId, willExpand);
    track(willExpand ? 'expandScope' : 'collapseScope');
  }, [ scopeId, expanded, setExpanded, track ]);

  return [ expanded, toggle ];
}
