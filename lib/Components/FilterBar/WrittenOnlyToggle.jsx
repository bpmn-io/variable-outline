// eslint-disable-next-line no-unused-vars
import React, { useContext } from 'react';
import { Edit } from '@carbon/icons-react';

import { FilterContext } from '../../Context/FilterContext';

export default function WrittenOnlyToggle() {
  const [ filter, setFilter ] = useContext(FilterContext);

  const writtenOnly = filter.writtenOnly || false;

  const handleToggle = () => {
    setFilter({ ...filter, writtenOnly: !writtenOnly });
  };

  return (
    <button
      className={ `filter-toggle${writtenOnly ? ' filter-toggle--active' : ''}` }
      onClick={ handleToggle }
      title="Hide variables that are available, but not used"
      aria-pressed={ writtenOnly }
      type="button"
    >
      <Edit className="filter-toggle-icon" />
      <span className="filter-toggle-label">Written variables only</span>
    </button>
  );
}
