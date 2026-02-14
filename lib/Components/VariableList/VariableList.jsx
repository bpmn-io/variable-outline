// eslint-disable-next-line no-unused-vars
import React, { useContext, useMemo } from 'react';

import parseRows from '../../utils/parseRows';
import useExpandable from '../../hooks/useExpandable';
import useService from '../../hooks/useService';
import ScopeGroup from './ScopeGroup';
import { FilterContext } from '../../Context/FilterContext';

import '../outline-variables.scss';

export default function VariableList({ variables }) {
  const rows = parseRows(variables);
  const [ filter ] = useContext(FilterContext);
  const selection = useService('selection');
  const [ expandedId, handleToggle ] = useExpandable();

  const sortedRows = [ ...rows ].sort((a, b) => a.name.localeCompare(b.name));

  const selectedElementIds = (selection.get() || []).map(el => el.id);

  const variableGroupsByScope = useMemo(() => {
    const groups = new Map();

    for (const row of sortedRows) {
      const scopeId = row.scope?.id || 'unknown';

      if (!groups.has(scopeId)) {
        groups.set(scopeId, {
          scope: row.scope,
          scopeId,
          rows: []
        });
      }

      groups.get(scopeId).rows.push(row);
    }

    // Sort: process first, then in-between alphabetically, then local (selected) last
    const variableGroupsByScope = Array.from(groups.values()).sort((a, b) => {
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

    return variableGroupsByScope;
  }, [ selectedElementIds, variables ]);

  return (
    <div className="variable-list-container">
      <div className="variable-list-inner">
        {
          variableGroupsByScope.map(group => {
            const isProcess = group.scope?.$type === 'bpmn:Process';
            const isLocal = selectedElementIds.includes(group.scopeId);

            let displayName;
            let defaultExpanded = true;
            const scopeName = group.scope?.name || group.scopeId;

            if (isProcess) {
              displayName = 'Global variables';
            } else if (isLocal) {
              displayName = `${scopeName} variables (local)`;
            } else {
              displayName = `${scopeName} variables`;
              defaultExpanded = false;
            }

            return (
              <ScopeGroup
                key={ group.scopeId }
                scopeName={ displayName }
                rows={ group.rows }
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
