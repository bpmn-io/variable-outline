import { Search as CarbonSearch, Tooltip } from '@carbon/react';
import { Help } from '@carbon/icons-react';

import useFilter from '../../hooks/useFilter';

import './Search.scss';

export default function Search() {

  const { search, setSearch } = useFilter();

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  return <div className="bio-vo-search-container">
    <CarbonSearch
      className="bio-vo-search"
      size="md"
      placeholder="Filter by name, origin, or scope"
      labelText="Filter variables"
      onChange={ handleSearch }
      value={ search }
      type="inline"
    />

    <Tooltip
      className="bio-vo-help"
      label="This panel shows the variables accessible to the selected element, grouped by scope. Expand a variable to see which elements write it and what value it holds. Type in the input to filter by name, origin, or scope."
      align="bottom-end"
      autoAlign
    >
      <Help />
    </Tooltip>
  </div>;
}
