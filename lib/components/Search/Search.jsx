import { useEffect, useMemo } from 'react';
import { Button, SearchInput } from '@camunda/design-system';
import { CircleQuestionMark } from '@camunda/design-system/icons';
import { debounce } from 'min-dash';

import Tooltip from '../Tooltip';

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
    <SearchInput
      className="bio-vo-search"
      placeholder="Filter by name, origin, or scope"
      aria-label="Filter variables"
      onChange={ handleSearch }
      value={ search }
    />

    <Tooltip label="This panel shows the variables accessible to the selected element, grouped by scope. Expand a variable to see which elements write it and what value it holds. Type in the input to filter by name, origin, or scope.">
      <Button variant="ghost" size="icon-sm" aria-label="Help">
        <CircleQuestionMark />
      </Button>
    </Tooltip>
  </div>;
}
