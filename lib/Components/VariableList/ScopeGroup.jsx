import { ChevronRight } from '@carbon/icons-react';
import { Tag } from '@carbon/react';

import VariableRow from './VariableRow';
import { preventEnterOrSpace } from '../../utils/preventEnterOrSpace';
import { getSVGComponent } from './Icons';
import useService from '../../hooks/useService';
import useExpandable from '../../hooks/useExpandable';
import useScopeExpand from '../../hooks/useScopeExpand';

export default function ScopeGroup({ scopeName, scope, variables, filter, defaultExpanded = true, isLocal = false, scopeType = 'parent' }) {
  const [ expandedIds, handleToggle ] = useExpandable();
  const [ expanded, toggleExpanded ] = useScopeExpand(scope.id, defaultExpanded);

  const elementRegistry = useService('elementRegistry');
  const element = elementRegistry.get(scope.id);
  const ScopeIcon = getSVGComponent(element);

  const rows = variables.map(variable => {
    const isSelectedOrigin = filter.selectedElements.some(id =>
      variable.origin?.some(o => o.id === id)
    );
    return (
      <VariableRow
        key={ variable.id }
        variable={ variable }
        isSelectedOrigin={ isSelectedOrigin }
        expanded={ expandedIds.has(variable.id) }
        onToggle={ () => handleToggle(variable.id) }
      />
    );
  });

  return (
    <div className={ `variable-scope-group${isLocal ? ' variable-scope-group--local' : ''}` }>
      <div
        className={ `variable-section-header${!expanded ? ' variable-section-header--collapsed' : ' variable-section-header--expanded'}${isLocal ? ' variable-section-header--local' : ''}` }
        onClick={ toggleExpanded }
        role="button"
        tabIndex={ 0 }
        aria-expanded={ expanded }
        onKeyDown={ preventEnterOrSpace(toggleExpanded) }
      >
        <ChevronRight className={ `variable-section-chevron${!expanded ? '' : ' variable-section-chevron--expanded'}` } />

        { ScopeIcon && <ScopeIcon className="variable-section-scope-icon" /> }
        <span className="variable-section-name">{ scopeName }</span>
        <Tag
          className="variable-scope-chip"
          type={ scopeType === 'local' ? 'blue' : 'outline' }
          size="sm"
        >
          { scopeType === 'root' ? 'Root' : scopeType === 'local' ? 'Local' : 'Parent' }
        </Tag>
        <span className="variable-section-count">{ variables.length }</span>
      </div>
      { expanded && (
        <div className={ `variable-scope-rows${isLocal ? ' variable-scope-rows--local' : ''}` }>
          { rows }
        </div>
      ) }
    </div>
  );
}
