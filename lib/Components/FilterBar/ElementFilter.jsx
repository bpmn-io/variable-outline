import { useCallback, useContext, useMemo, useState } from 'react';
import { ChevronDown, Close } from '@carbon/icons-react';

import { FilterContext } from '../../Context/FilterContext';
import useService from '../../hooks/useService';
import useClickOutside from '../../hooks/useClickOutside';
import { getName } from '../../utils/elementUtil';

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
            name: getName(origin),
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
            name: getName(element.businessObject) || id,
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

  const handleToggleElement = useCallback((elementId) => {
    setFilter(prev => {
      const current = prev.selectedElements || [];
      const isSelected = current.includes(elementId);
      const updated = isSelected
        ? current.filter(id => id !== elementId)
        : [ ...current, elementId ];
      return { ...prev, selectedElements: updated };
    });
  }, [ setFilter ]);


  const handleClearAll = () => {
    setFilter(prev => ({ ...prev, selectedElements: [] }));
  };

  const label = selectedElements.length === 1
    ? elements.find(el => el.id === selectedElements[0])?.name || selectedElements[0]
    : selectedElements.length > 1
      ? `${selectedElements.length} elements`
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
        <ChevronDown className="filter-dropdown-icon" />
      </button>
      { selectedElements.length > 0 && (
        <button
          type="button"
          className="filter-dropdown-clear"
          onClick={ handleClearAll }
          aria-label="Clear element filter"
        >
          <Close className="filter-dropdown-icon" aria-hidden="true" />
        </button>
      ) }
      { open && (
        <div className="filter-dropdown-menu" role="listbox" aria-label="Filter by element" aria-multiselectable="true">
          { elements.length > 0 ? elements.map(el => (
            <button
              key={ el.id }
              type="button"
              className={ `filter-dropdown-option${selectedElements.includes(el.id) ? ' filter-dropdown-option--selected' : ''}` }
              role="option"
              aria-selected={ selectedElements.includes(el.id) }
              onClick={ () => handleToggleElement(el.id) }
            >
              <span className="filter-dropdown-checkbox" aria-hidden="true" />
              <span className="filter-dropdown-option-label">{ el.name }</span>
              <span className="filter-dropdown-option-badge">{ el.variableCount }</span>
            </button>
          )) : (
            <div className="filter-dropdown-empty">No elements found</div>
          ) }
        </div>
      ) }
    </div>
  );
}
