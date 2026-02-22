import { useState, useEffect } from 'react';
import { ChevronRight } from '@carbon/icons-react';

import VariableRow from './VariableRow';
import { preventEnterOrSpace } from '../../utils/preventEnterOrSpace';
import { getSVGComponent } from './Icons';
import useService from '../../hooks/useService';

export default function ScopeGroup({ scopeName, scope, variables, filter, expandedId, onToggle, defaultExpanded = true, isLocal = false }) {
  const [ expanded, setExpanded ] = useState(defaultExpanded);

  const elementRegistry = useService('elementRegistry');

  useEffect(() => {
    if (isLocal) {
      setExpanded(true);
    }
  }, [ isLocal ]);

  const toggleExpanded = () => setExpanded(!expanded);

  const element = scope && elementRegistry ? elementRegistry.get(scope.id) : null;
  const ScopeIcon = (element || scope) ? getSVGComponent(element || scope) : null;

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
        <span className="variable-section-count">{ variables.length }</span>
      </div>
      { expanded && (
        <div className={ `variable-scope-rows${isLocal ? ' variable-scope-rows--local' : ''}` }>
          { variables.map(variable => {
            const isSelectedOrigin = filter.selectedElements.some(id =>
              variable.origin?.some(o => o.id === id)
            );
            return (
              <VariableRow
                key={ variable.id }
                variable={ variable }
                isSelectedOrigin={ isSelectedOrigin }
                expanded={ expandedId === variable.id }
                onToggle={ () => onToggle(variable.id) }
              />
            );
          }) }
        </div>
      ) }
    </div>
  );
}
