import { Search as CarbonSearch, Tooltip } from '@carbon/react';
import { Help } from '@carbon/icons-react';

import { FilterContext } from '../../context/FilterContext';
import { useContext } from 'react';

import './Search.scss';

export default function Search() {

  const [ filter, setFilter ] = useContext(FilterContext);

  const search = filter.search || '';

  const handleSearch = (event) => {
    setFilter({ ...filter, search: event.target.value });
  };

  return <div className="bio-vo-search-container">
    <CarbonSearch
      className="bio-vo-search"
      size="md"
      placeholder="Search variables for name, scope, or origin"
      labelText="Search"
      onChange={ handleSearch }
      value={ search }
      type="inline"
    />

    <Tooltip
      className="bio-vo-help"
      label="This panel shows the variables accessible to the selected element, grouped by scope. Expand a variable to see which elements write it and what value it holds. Use the search or filters to narrow down the list."
      align="bottom-end"
    >
      <Help />
    </Tooltip>
  </div>;
}
