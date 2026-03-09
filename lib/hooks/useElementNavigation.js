import { useCallback } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import useService from './useService';

export default function useElementNavigation(businessObject) {
  const selection = useService('selection');
  const canvas = useService('canvas');
  const elementRegistry = useService('elementRegistry');

  const selectedElements = selection.get();
  const isSelected = selectedElements.some(el => el.id === businessObject.id);

  const navigate = useCallback(() => {
    if (is(businessObject, 'bpmn:Process')) {
      selection.select([]);
      return;
    }

    const element = elementRegistry.get(businessObject.id);

    if (!element) {
      return;
    }

    canvas.scrollToElement(element);
    selection.select(element);
  }, [ businessObject, selection, canvas, elementRegistry ]);

  return { isSelected, navigate };
}
