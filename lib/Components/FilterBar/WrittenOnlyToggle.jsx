import { useContext } from 'react';


import { FilterContext } from '../../Context/FilterContext';

export default function WrittenOnlyToggle() {
  const [ filter, setFilter ] = useContext(FilterContext);

  const writtenOnly = filter.writtenOnly || false;

  const handleToggle = () => {
    setFilter({ ...filter, writtenOnly: !writtenOnly });
  };

  return (
    <label
      className={ `filter-toggle${writtenOnly ? ' filter-toggle--active' : ''}` }
      title="Hide variables that are available, but not used"
    >
      <input
        type="checkbox"
        checked={ writtenOnly }
        onChange={ handleToggle }
        className="filter-dropdown-checkbox"
      />
      Written by current selection
    </label>
  );

}
