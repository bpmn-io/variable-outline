/* global requestAnimationFrame */

import { useContext, useEffect, useRef } from 'react';

import { FilterContext } from '../Context/FilterContext';
import useService from './useService';

/**
 * Bidirectional sync between canvas selection and FilterContext.selectedElements.
 *
 * Canvas → Filter: selection.changed → update selectedElements
 * Filter → Canvas: selectedElements change → call selection.select()
 * Loop prevention via guard ref.
 */
export default function useCanvasSync() {
  const [ filter, setFilter ] = useContext(FilterContext);
  const selection = useService('selection');
  const eventBus = useService('eventBus');
  const elementRegistry = useService('elementRegistry');
  const syncingRef = useRef(false);

  // Canvas → Filter: when user selects elements on canvas, update filter
  useEffect(() => {
    const onSelectionChanged = (e) => {
      if (syncingRef.current) return;

      const selected = e.newSelection || [];
      const elementIds = selected.map(el => el.id);

      syncingRef.current = true;
      setFilter(prev => ({
        ...prev,
        selectedElements: elementIds
      }));

      // Guard prevents infinite loop: Canvas→Filter and Filter→Canvas effects both
      // check the ref; release after next frame so both have run for this tick.

      requestAnimationFrame(() => { syncingRef.current = false; });
    };

    eventBus.on('selection.changed', onSelectionChanged);

    return () => {
      eventBus.off('selection.changed', onSelectionChanged);
    };
  }, [ eventBus, setFilter ]);

  // Filter → Canvas: when user changes selectedElements in filter, update canvas
  useEffect(() => {
    if (syncingRef.current) return;

    const elements = filter.selectedElements
      .map(id => elementRegistry.get(id))
      .filter(Boolean);

    const currentSelection = selection.get();
    const currentIds = currentSelection.map(el => el.id).sort().join(',');
    const newIds = [ ...filter.selectedElements ].sort().join(',');

    // only sync if actually different
    if (currentIds !== newIds) {
      syncingRef.current = true;
      selection.select(elements);

      // Guard prevents infinite loop: Canvas→Filter and Filter→Canvas effects both
      // check the ref; release after next frame so both have run for this tick.

      requestAnimationFrame(() => { syncingRef.current = false; });
    }
  }, [ filter.selectedElements, selection, elementRegistry ]);
}
