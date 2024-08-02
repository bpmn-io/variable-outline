import { Checkbox, Search, Tooltip } from '@carbon/react';
import { Help } from '@carbon/icons-react';

import { FilterContext } from '../../Context/FilterContext';
import { useContext } from 'react';

import './Search.scss';

export default () => {

  const [ filter, setFilter ] = useContext(FilterContext);

  const search = filter.search || '';
  const handleSearch = (event) => {
    setFilter({ ...filter, search: event.target.value });
  };

  const handleChange = (_, data) => {
    setFilter({ ...filter, filterType: data.checked ? 'origin' : 'all' });
  };

  return <div className="bio-vo-search-container">
    <Search
      className="bio-vo-search"
      size="md"
      placeholder="Search variables for name, scope, or origin"
      labelText="Filter"
      closeButtonLabelText="Clear filter input"
      id="search-1"
      onChange={ handleSearch }
      value={ search }
      type="inline"
    />
    <div className="bio-vo-checkbox">
      <Checkbox id="written-only" checked={ filter.filterType === 'origin' } onChange={ handleChange } labelText={
        <Tooltip label="Hide variables that are available, but not used" align="bottom-end">
          <span className="bio-vo-tooltip-wrapper">Written variables only</span>
        </Tooltip>
      } />
    </div>
    <Tooltip
      className="bio-vo-help"
      label="This panel provides information about the variables in your process. Elements that create or modify variables are shown on the left, and the variables associated with the selected element are shown on the right. You can select any element on the canvas to see what variables it uses or can use."
      align="bottom-end"
    >
      <Help />
    </Tooltip>
  </div>;

};