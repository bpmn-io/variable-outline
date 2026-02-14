// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { ChevronRight, DataStructured, LocationCurrent } from '@carbon/icons-react';

import VariableRow from './VariableRow';
import { preventEnterOrSpace } from '../../utils/preventEnterOrSpace';

export default function ScopeGroup({ scopeName, rows, filter, expandedId, onToggle, defaultExpanded = true, isLocal = false }) {
  const [ expanded, setExpanded ] = useState(defaultExpanded);

  useEffect(() => {
    if (isLocal) {
      setExpanded(true);
    }
  }, [ isLocal ]);

  const toggleExpanded = () => setExpanded(!expanded);

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
        { isLocal ? <LocationCurrent className="variable-row-icon" /> : <DataStructured className="variable-row-icon" /> }
        <span className="variable-section-name">{ scopeName }</span>
        <span className="variable-section-count">{ rows.length }</span>
      </div>
      { expanded && (
        <div className={ `variable-scope-rows${isLocal ? ' variable-scope-rows--local' : ''}` }>
          { rows.map(row => {
            const isSelectedOrigin = filter.selectedElements.some(id =>
              row.origin?.some(o => o.id === id)
            );
            return (
              <VariableRow
                key={ row.id }
                row={ row }
                isSelectedOrigin={ isSelectedOrigin }
                expanded={ expandedId === row.id }
                onToggle={ () => onToggle(row.id) }
              />
            );
          }) }
        </div>
      ) }
    </div>
  );
}
