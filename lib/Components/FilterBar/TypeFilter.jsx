// eslint-disable-next-line no-unused-vars
import React, { useContext, useMemo, useState } from 'react';
import { ChevronDown, Close } from '@carbon/icons-react';

import { FilterContext } from '../../Context/FilterContext';
import useClickOutside from '../../hooks/useClickOutside';

export default function TypeFilter({ variables }) {
  const [ filter, setFilter ] = useContext(FilterContext);
  const [ open, setOpen ] = useState(false);
  const ref = useClickOutside(() => setOpen(false), open);

  const types = useMemo(() => {
    const typeSet = new Set();

    variables.forEach(variable => {
      if (variable.detail) {
        variable.detail.split('|').filter(t => t.trim()).forEach(t => {
          typeSet.add(t.trim());
        });
      }
    });

    return Array.from(typeSet).sort();
  }, [ variables ]);

  const filterType = filter.filterType || 'all';

  const handleSelectType = (type) => {
    setFilter({ ...filter, filterType: type });
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setFilter({ ...filter, filterType: 'all' });
  };

  const label = filterType !== 'all' ? filterType : 'All types';

  return (
    <div className="filter-dropdown" ref={ ref }>
      <button
        className={ `filter-dropdown-trigger${filterType !== 'all' ? ' filter-dropdown-trigger--active' : ''}` }
        onClick={ () => setOpen(!open) }
        aria-expanded={ open }
        aria-haspopup="listbox"
        type="button"
      >
        <span className="filter-dropdown-label">{ label }</span>
        { filterType !== 'all' ? (
          <Close className="filter-dropdown-icon" onClick={ handleClear } />
        ) : (
          <ChevronDown className="filter-dropdown-icon" />
        ) }
      </button>
      { open && (
        <div className="filter-dropdown-menu" role="listbox">
          <button
            className={ `filter-dropdown-option${filterType === 'all' ? ' filter-dropdown-option--selected' : ''}` }
            role="option"
            aria-selected={ filterType === 'all' }
            onClick={ () => handleSelectType('all') }
            type="button"
          >
            <span className="filter-dropdown-option-label">All types</span>
          </button>
          { types.map(type => (
            <button
              key={ type }
              className={ `filter-dropdown-option${filterType === type ? ' filter-dropdown-option--selected' : ''}` }
              role="option"
              aria-selected={ filterType === type }
              onClick={ () => handleSelectType(type) }
              type="button"
            >
              <span className="filter-dropdown-option-label">{ type }</span>
            </button>
          )) }
        </div>
      ) }
    </div>
  );
}
