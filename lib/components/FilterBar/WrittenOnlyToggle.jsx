import { useContext } from 'react';

import { Toggle } from '@carbon/react';
import { FilterContext } from '../../context/FilterContext';

export default function WrittenOnlyToggle() {
  const [ filter, setFilter ] = useContext(FilterContext);

  const writtenOnly = filter.writtenOnly || false;

  const handleToggle = () => {
    setFilter((previousFilter) => ({
      ...previousFilter,
      writtenOnly: !previousFilter.writtenOnly
    }));
  };

  return (
    <div className="bio-vo-written-only-toggle">
      <Toggle
        id="written-only-toggle"
        size="sm"
        labelText="Written by selection"
        hideLabel
        toggled={ writtenOnly }
        onToggle={ handleToggle }
        aria-label="Written by current selection"
      />
    </div>
  );

}
