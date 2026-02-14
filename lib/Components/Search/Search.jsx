import { Search } from '@carbon/react';

import { FilterContext } from '../../Context/FilterContext';
import { useContext } from 'react';

import './Search.scss';

export default () => {

  const [ filter, setFilter ] = useContext(FilterContext);

  const search = filter.search || '';

  const handleSearch = (event) => {
    setFilter({ ...filter, search: event.target.value });
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
  </div>;

};