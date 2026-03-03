import { useMemo } from 'react';

function getScopeDepth(scope) {
  let depth = 0;
  let current = scope;
  while (current && current.$parent) {
    depth++;
    current = current.$parent;
  }
  return depth;
}

export default function useGroupedVariables(sortedVariables, selectedElementIds) {
  return useMemo(() => {
    const groups = new Map();

    for (const variable of sortedVariables) {
      const scopeId = variable.scope?.id || 'unknown';

      if (!groups.has(scopeId)) {
        groups.set(scopeId, {
          scope: variable.scope,
          scopeId,
          variables: []
        });
      }

      groups.get(scopeId).variables.push(variable);
    }

    return Array.from(groups.values()).sort((a, b) => {
      const aIsProcess = a.scope?.$type === 'bpmn:Process';
      const bIsProcess = b.scope?.$type === 'bpmn:Process';
      const aIsLocal = selectedElementIds.includes(a.scopeId);
      const bIsLocal = selectedElementIds.includes(b.scopeId);

      if (aIsProcess && !bIsProcess) return -1;
      if (!aIsProcess && bIsProcess) return 1;
      if (aIsLocal && !bIsLocal) return 1;
      if (!aIsLocal && bIsLocal) return -1;

      // Intermediate scopes: sort by depth (shallower = outer = first)
      const depthA = getScopeDepth(a.scope);
      const depthB = getScopeDepth(b.scope);

      if (depthA !== depthB) {
        return depthA - depthB; // shallower (lower depth) sorts first
      }

      // Same depth (siblings): alphabetical fallback
      const aName = a.scope?.name || a.scopeId;
      const bName = b.scope?.name || b.scopeId;
      return aName.localeCompare(bName);
    });
  }, [ selectedElementIds, sortedVariables ]);
}
