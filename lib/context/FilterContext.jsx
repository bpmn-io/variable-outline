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
  const selection = useService('selection');

  const [ filter, setFilter ] = useState({
    search: '',
    selectedElementIds: [],
    writtenOnly: false
  });

  useEffect(() => {
    function onSelectionChanged(e) {
      const selected = e.newSelection || [];

      setFilter(prev => ({
        ...prev,
        selectedElementIds: selected.map(el => el.id)
      }));
    }

    eventBus.on('selection.changed', onSelectionChanged);

    return () => {
      eventBus.off('selection.changed', onSelectionChanged);
    };
  }, [ eventBus ]);

  useEffect(() => {
    const currentSelection = selection.get();

    if (currentSelection.length) {
      setFilter(prev => ({
        ...prev,
        selectedElementIds: currentSelection.map(el => el.id)
      }));
    }
  }, [ selection ]);

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
