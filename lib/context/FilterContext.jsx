import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import useService from '../hooks/useService';

export const FilterContext = createContext({
  search: '',
  setSearch: () => {},
  writtenOnly: false,
  toggleWrittenOnly: () => {},
  selectedElementIds: []
});

export function FilterProvider({ children }) {
  const eventBus = useService('eventBus');

  const [ filter, setFilter ] = useState({
    search: '',
    selectedElementIds: [],
    writtenOnly: false
  });

  const onSelectionChanged = useCallback((e) => {
    const selected = e.newSelection || [];
    const elementIds = selected.map(el => el.id);

    setFilter(prev => ({
      ...prev,
      selectedElementIds: elementIds
    }));
  }, []);

  useEffect(() => {
    eventBus.on('selection.changed', onSelectionChanged);

    return () => {
      eventBus.off('selection.changed', onSelectionChanged);
    };
  }, [ eventBus, onSelectionChanged ]);

  const setSearch = useCallback((value) => {
    setFilter(prev => ({
      ...prev,
      search: value
    }));
  }, []);

  const toggleWrittenOnly = useCallback(() => {
    setFilter(prev => ({
      ...prev,
      writtenOnly: !prev.writtenOnly
    }));
  }, []);

  const value = useMemo(() => ({
    ...filter,
    setSearch,
    toggleWrittenOnly
  }), [ filter ]);

  return <FilterContext.Provider value={ value }>{ children }</FilterContext.Provider>;
}
