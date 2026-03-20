import { useEffect, useMemo } from 'react';
import { Search as CarbonSearch, Tooltip } from '@carbon/react';
import { Help } from '@carbon/icons-react';
import { debounce } from 'min-dash';

import useFilter from '../../hooks/useFilter';
import useTracking from '../../hooks/useTracking';

import './Search.scss';

const SEARCH_DEBOUNCE_DELAY = 300;

export default function Search() {

  const { search, setSearch } = useFilter();
  const track = useTracking();

  const trackSearch = useMemo(
    () => debounce(() => {
      track('searched');
    }, SEARCH_DEBOUNCE_DELAY),
    [ track ]
  );

  useEffect(() => {
    return () => trackSearch.cancel();
  }, [ trackSearch ]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);

    if (value.length > 0) {
      trackSearch();
    } else {
      trackSearch.cancel();
    }
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
