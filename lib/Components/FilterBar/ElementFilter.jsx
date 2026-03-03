import { useState } from 'react';
import { ChevronDown, Close } from '@carbon/icons-react';

import useClickOutside from '../../hooks/useClickOutside';
import useElementFilter from '../../hooks/useElementFilter';


export default function ElementFilter({ variables }) {
  const { elements, selectedElements, label, handleToggleElement, handleClearAll } = useElementFilter(variables);
  const [ open, setOpen ] = useState(false);
  const ref = useClickOutside(() => setOpen(false), open);

  return (
    <div className="filter-dropdown" ref={ ref }>
      <button
        className={ `filter-dropdown-trigger${selectedElements.length > 0 ? ' filter-dropdown-trigger--active' : ''}` }
        onClick={ () => setOpen(!open) }
        aria-expanded={ open }
        aria-haspopup="true"
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
        <div className="filter-dropdown-menu" role="menu" aria-label="Filter by element">
          { elements.length > 0 ? elements.map(el => (
            <button
              key={ el.id }
              type="button"
              className={ `filter-dropdown-option${selectedElements.includes(el.id) ? ' filter-dropdown-option--selected' : ''}` }
              role="menuitemcheckbox"
              aria-checked={ selectedElements.includes(el.id) }
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
