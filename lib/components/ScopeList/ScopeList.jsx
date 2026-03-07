import { useContext } from 'react';

import parseVariables from '../../utils/parseRows';
import Scope from '../Scope';
import { FilterContext } from '../../context/FilterContext';
import useGroupedVariables from '../../hooks/useGroupedVariables';

import '../outline-variables.scss';

export default function ScopeList({ variables: rawVariables }) {
  const variables = parseVariables(rawVariables);
  const [ filter ] = useContext(FilterContext);
  const selectedElementIds = filter.selectedElements;
  const sortedVariables = [ ...variables ].sort((a, b) => a.name.localeCompare(b.name));

  const groupsByScope = useGroupedVariables(sortedVariables, selectedElementIds);

  return (
    <div className="variable-list-container">
      <div className="variable-list-inner">
        {
          groupsByScope.map(group => {
            const isProcess = group.scope?.$type === 'bpmn:Process';
            const isLocal = selectedElementIds.includes(group.scopeId);

            const displayName = group.scope?.name || group.scopeId;
            let defaultExpanded = true;
            let scopeType = 'parent';
            if (isProcess) {
              scopeType = 'root';
            } else if (isLocal) {
              scopeType = 'local';
            } else {
              defaultExpanded = false;
            }

            return (
              <Scope
                key={ group.scopeId }
                scopeName={ displayName }
                scope={ group.scope }
                variables={ group.variables }
                filter={ filter }
                defaultExpanded={ defaultExpanded }
                isLocal={ isLocal }
                scopeType={ scopeType }
              />
            );
          })
        }
      </div>
    </div>
  );
}
