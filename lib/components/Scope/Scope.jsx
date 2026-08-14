import { ChevronRight } from '@carbon/icons-react';

import VariableRow from '../VariableRow';
import { getSVGComponent } from '../BpmnIcon';
import useService from '../../hooks/useService';
import useExpandable from '../../hooks/useExpandable';
import useFilter from '../../hooks/useFilter';
import useScopeExpand from '../../hooks/useScopeExpand';
import useTracking from '../../hooks/useTracking';

export default function Scope({ scopeName, scope, variables, defaultExpanded = true, isLocal = false, scopeType = 'parent' }) {
  const [ expandedIds, handleToggle ] = useExpandable();
  const [ expanded, toggleExpanded ] = useScopeExpand(scope.id, defaultExpanded);
  const { selectedElementIds } = useFilter();
  const track = useTracking();

  const elementRegistry = useService('elementRegistry');
  const element = elementRegistry.get(scope.id);
  const ScopeIcon = element ? getSVGComponent(element) : null;

  // a variable carries no id; within a scope its name identifies it, as the
  // resolver keeps one record per name and scope
  const rows = variables.map(variable => {
    const { name } = variable;

    const isSelectedOrigin = selectedElementIds.some(id =>
      variable.origin?.some(o => o.id === id)
    );
    return (
      <VariableRow
        key={ name }
        variable={ variable }
        isSelectedOrigin={ isSelectedOrigin }
        expanded={ expandedIds.has(name) }
        onToggle={ () => {
          const willExpand = !expandedIds.has(name);
          handleToggle(name);
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
        <span className="variable-section-name">{ scopeName }</span>
        <span
          className={ `variable-scope-chip${scopeType === 'local' ? ' variable-scope-chip--local' : ''}` }
        >
          { scopeType === 'root' ? 'Root' : scopeType === 'local' ? 'Local' : 'Parent' }
        </span>
        <span className="variable-section-count">{ variables.length }</span>
      </button>

      { expanded && (
        <div className={ `variable-scope-rows${isLocal ? ' variable-scope-rows--local' : ''}` }>
          { rows }
        </div>
      ) }
    </div>
  );
}
