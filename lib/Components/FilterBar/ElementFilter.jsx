// eslint-disable-next-line no-unused-vars
import React, { useContext, useMemo, useState } from 'react';
import { ChevronDown, Close } from '@carbon/icons-react';

import { FilterContext } from '../../Context/FilterContext';
import useService from '../../hooks/useService';
import useClickOutside from '../../hooks/useClickOutside';

export default function ElementFilter({ variables }) {
  const [ filter, setFilter ] = useContext(FilterContext);
  const elementRegistry = useService('elementRegistry');
  const [ open, setOpen ] = useState(false);
  const ref = useClickOutside(() => setOpen(false), open);

  const selectedElements = filter.selectedElements || [];

  const elements = useMemo(() => {
    const elementMap = new Map();

    variables.forEach(variable => {
      variable.origin?.forEach(origin => {
        if (!elementMap.has(origin.id)) {
          const element = elementRegistry.get(origin.id);
          elementMap.set(origin.id, {
            id: origin.id,
            name: origin.name || origin.id,
            variableCount: 0,
            element
          });
        }
        elementMap.get(origin.id).variableCount++;
      });
    });

    selectedElements.forEach(id => {
      if (!elementMap.has(id)) {
        const element = elementRegistry.get(id);
        if (element) {
          elementMap.set(id, {
            id,
            name: element.businessObject?.name || id,
            variableCount: 0,
            element
          });
        }
      }
    });

    return Array.from(elementMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [ variables, elementRegistry, selectedElements ]);

  const handleToggleElement = (elementId) => {
    const isSelected = selectedElements.includes(elementId);
    const updated = isSelected
      ? selectedElements.filter(id => id !== elementId)
      : [ ...selectedElements, elementId ];

    setFilter(prev => ({ ...prev, selectedElements: updated }));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    setFilter(prev => ({ ...prev, selectedElements: [] }));
  };

  const label = selectedElements.length > 0
    ? `${selectedElements.length} element${selectedElements.length > 1 ? 's' : ''}`
    : 'All elements';

  return (
    <div className="filter-dropdown" ref={ ref }>
      <button
        className={ `filter-dropdown-trigger${selectedElements.length > 0 ? ' filter-dropdown-trigger--active' : ''}` }
        onClick={ () => setOpen(!open) }
        aria-expanded={ open }
        aria-haspopup="listbox"
        type="button"
      >
        <span className="filter-dropdown-label">{ label }</span>
        { selectedElements.length > 0 ? (
          <Close className="filter-dropdown-icon" onClick={ handleClearAll } />
        ) : (
          <ChevronDown className="filter-dropdown-icon" />
        ) }
      </button>
      { open && (
        <div className="filter-dropdown-menu" role="listbox" aria-multiselectable="true">
          { elements.length > 0 ? elements.map(el => (
            <label
              key={ el.id }
              className={ `filter-dropdown-option${selectedElements.includes(el.id) ? ' filter-dropdown-option--selected' : ''}` }
              role="option"
              aria-selected={ selectedElements.includes(el.id) }
            >
              <input
                type="checkbox"
                checked={ selectedElements.includes(el.id) }
                onChange={ () => handleToggleElement(el.id) }
                className="filter-dropdown-checkbox"
              />
              <span className="filter-dropdown-option-label">{ el.name }</span>
              <span className="filter-dropdown-option-badge">{ el.variableCount }</span>
            </label>
          )) : (
            <div className="filter-dropdown-empty">No elements found</div>
          ) }
        </div>
      ) }
    </div>
  );
}
