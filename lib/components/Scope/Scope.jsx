import { ChevronRight, Information } from '@carbon/icons-react';
import { Tooltip } from '@carbon/react';

import VariableRow from '../VariableRow';
import { getSVGComponent } from '../BpmnIcon';
import useService from '../../hooks/useService';
import useExpandable from '../../hooks/useExpandable';
import useFilter from '../../hooks/useFilter';
import useScopeExpand from '../../hooks/useScopeExpand';
import useTracking from '../../hooks/useTracking';
import { getName } from '../../utils/elementUtil';

export default function Scope({ scopeName, scope, scopeId, variables, defaultExpanded = true, isLocal = false, isExternal = false }) {
  const [ expandedIds, handleToggle ] = useExpandable();
  const [ expanded, toggleExpanded ] = useScopeExpand(scope?.id ?? scopeId, defaultExpanded);
  const { selectedElementIds } = useFilter();
  const track = useTracking();

  const elementRegistry = useService('elementRegistry');
  const element = scope ? elementRegistry.get(scope.id) : null;
  const ScopeIcon = element ? getSVGComponent(element) : null;

  const selectedElement = selectedElementIds.length === 1
    ? elementRegistry.get(selectedElementIds[0])
    : null;
  const selectionName = selectedElement?.businessObject
    ? getName(selectedElement.businessObject)
    : null;

  const rows = variables.map(variable => {
    const isSelectedOrigin = selectedElementIds.some(id =>
      variable.origin?.some(o => o.id === id)
    );
    const isSelectedReader = selectedElementIds.some(id =>
      variable.usedBy?.some(el => el && el.id === id)
    );
    return (
      <VariableRow
        key={ variable.id }
        variable={ variable }
        isSelectedOrigin={ isSelectedOrigin }
        isSelectedReader={ isSelectedReader }
        selectionName={ selectionName }
        expanded={ expandedIds.has(variable.id) }
        onToggle={ () => {
          const willExpand = !expandedIds.has(variable.id);
          handleToggle(variable.id);
          track(willExpand ? 'expandVariable' : 'collapseVariable');
        } }
      />
    );
  });

  return (
    <div className={ `variable-scope-group${expanded ? ' variable-scope-group--expanded' : ''}${isLocal ? ' variable-scope-group--local' : ''}` }>
      <button
        type="button"
        className={ `variable-section-header${expanded ? ' variable-section-header--expanded' : ' variable-section-header--collapsed'}${isLocal ? ' variable-section-header--local' : ''}` }
        onClick={ toggleExpanded }
        aria-expanded={ expanded }
      >
        <ChevronRight className={ `variable-section-chevron${!expanded ? '' : ' variable-section-chevron--expanded'}` } />

        { ScopeIcon && <ScopeIcon className="variable-section-scope-icon" /> }
        <span className="variable-section-name" title={ scopeName }>{ scopeName }</span>

        { isLocal && (
          <Tooltip label="Scope of the current selection" align="bottom" autoAlign>
            <span className="variable-scope-current-tag">current scope</span>
          </Tooltip>
        ) }

        { !expanded && (
          <span className="variable-section-count">
            { variables.length === 1 ? '1 variable' : `${variables.length} variables` }
          </span>
        ) }
      </button>

      { expanded && (
        <div className={ `variable-scope-rows${isLocal ? ' variable-scope-rows--local' : ''}` }>
          { isExternal && (
            <div className="variable-scope-info-banner">
              <Information aria-hidden="true" />
              These variables are referenced in the diagram but never written. They must be provided as input at runtime.
            </div>
          ) }
          { rows }
        </div>
      ) }
    </div>
  );
}
