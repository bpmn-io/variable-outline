import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import parseVariables from '../../utils/parseRows';
import Scope from '../Scope';
import useFilter from '../../hooks/useFilter';
import useGroupedVariables from '../../hooks/useGroupedVariables';
import useService from '../../hooks/useService';

import '../outline-variables.scss';

export default function ScopeList({ variables: rawVariables }) {
  const variables = parseVariables(rawVariables);
  const { selectedElementIds } = useFilter();
  const elementRegistry = useService('elementRegistry');
  const sortedVariables = variables.toSorted((a, b) => a.name.localeCompare(b.name));

  const groupsByScope = useGroupedVariables(sortedVariables, selectedElementIds);

  const selectedScopeIds = selectedElementIds.map(id => {
    const element = elementRegistry.get(id);

    if (is(element, 'bpmn:Participant')) {
      return getBusinessObject(element).processRef?.id || id;
    }

    return id;
  });

  return (
    <div className="variable-list-container">
      <div className="variable-list-inner">
        {
          groupsByScope.map(group => {
            const isProcess = is(group.scope, 'bpmn:Process');
            const isLocal = selectedScopeIds.includes(group.scopeId) ||
              (isProcess && selectedElementIds.length === 0);

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
