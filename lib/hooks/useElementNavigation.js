import { useContext, useCallback } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import useService from './useService';
import { FilterContext } from '../Context/FilterContext';

export default function useElementNavigation(businessObject) {
  const [ , setFilter ] = useContext(FilterContext);
  const selection = useService('selection');
  const canvas = useService('canvas');
  const elementRegistry = useService('elementRegistry');

  const selectedElements = selection.get();
  const isSelected = selectedElements.some(el => el.id === businessObject.id);

  const navigate = useCallback(() => {
    if (is(businessObject, 'bpmn:Process')) {
      selection.select([]);
      setFilter(prev => ({ ...prev, selectedElements: [] }));
      return;
    }

    const element = elementRegistry.get(businessObject.id);

    if (!element) {
      return;
    }

    canvas.scrollToElement(element);
    selection.select(element);
  }, [ businessObject, selection, canvas, elementRegistry, setFilter ]);

  return { isSelected, navigate };
}
