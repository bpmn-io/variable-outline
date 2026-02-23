import { useContext, useMemo } from 'react';

import parseVariables from '../../utils/parseRows';
import useService from '../../hooks/useService';
import ScopeGroup from './ScopeGroup';
import { FilterContext } from '../../Context/FilterContext';

import '../outline-variables.scss';

function getScopeDepth(scope) {
  let depth = 0;
  let current = scope;
  while (current && current.$parent) {
    depth++;
    current = current.$parent;
  }
  return depth;
}

export default function VariableList({ variables: rawVariables }) {
  const variables = parseVariables(rawVariables);
  const [ filter ] = useContext(FilterContext);
  const selection = useService('selection');
  const sortedVariables = [ ...variables ].sort((a, b) => a.name.localeCompare(b.name));

  const selectedElementIds = (selection.get() || []).map(el => el.id);

  const groupsByScope = useMemo(() => {
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
  }, [ selectedElementIds, rawVariables ]);

  return (
    <div className="variable-list-container">
      <div className="variable-list-inner">
        {
          groupsByScope.map(group => {
            const isProcess = group.scope?.$type === 'bpmn:Process';
            const isLocal = selectedElementIds.includes(group.scopeId);

            let displayName;
            let defaultExpanded = true;
            const scopeName = group.scope?.name || group.scopeId;

            if (isProcess) {
              displayName = 'Global parent scope variables';
            } else if (isLocal) {
              displayName = `${scopeName} local scope variables`;
            } else {
              displayName = `${scopeName} parent scope variables`;
              defaultExpanded = false;
            }

            return (
              <ScopeGroup
                key={ group.scopeId }
                scopeName={ displayName }
                scope={ group.scope }
                variables={ group.variables }
                filter={ filter }
                defaultExpanded={ defaultExpanded }
                isLocal={ isLocal }
              />
            );
          })
        }
      </div>
    </div>
  );
}
