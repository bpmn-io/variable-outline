// eslint-disable-next-line no-unused-vars
import React, { useContext, useMemo } from 'react';

import parseVariables from '../../utils/parseRows';
import useExpandable from '../../hooks/useExpandable';
import useService from '../../hooks/useService';
import ScopeGroup from './ScopeGroup';
import { FilterContext } from '../../Context/FilterContext';

import '../outline-variables.scss';

export default function VariableList({ variables: rawVariables }) {
  const variables = parseVariables(rawVariables);
  const [ filter ] = useContext(FilterContext);
  const selection = useService('selection');
  const [ expandedId, handleToggle ] = useExpandable();

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
                expandedId={ expandedId }
                onToggle={ handleToggle }
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
