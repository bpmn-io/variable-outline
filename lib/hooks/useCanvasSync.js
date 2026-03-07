import { useContext, useEffect } from 'react';

import { FilterContext } from '../context/FilterContext';
import useService from './useService';

/**
 * Sync canvas selection to FilterContext.selectedElements.
 * One-way: Canvas → Filter.
 */
export default function useCanvasSync() {
  const [ , setFilter ] = useContext(FilterContext);
  const eventBus = useService('eventBus');

  useEffect(() => {
    const onSelectionChanged = (e) => {
      const selected = e.newSelection || [];
      const elementIds = selected.map(el => el.id);

      setFilter(prev => ({
        ...prev,
        selectedElements: elementIds
      }));
    };

    eventBus.on('selection.changed', onSelectionChanged);

    return () => {
      eventBus.off('selection.changed', onSelectionChanged);
    };
  }, [ eventBus, setFilter ]);
}
