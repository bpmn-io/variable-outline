import { useCallback } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import useService from './useService';

const HIGHLIGHT_MARKER = 'bio-vo-highlight';

export default function useElementHighlight(businessObjects) {
  const canvas = useService('canvas');
  const elementRegistry = useService('elementRegistry');

  const highlight = useCallback(() => {
    for (const bo of businessObjects) {
      if (is(bo, 'bpmn:Process')) {
        continue;
      }

      const element = elementRegistry.get(bo.id);

      if (element) {
        canvas.addMarker(element, HIGHLIGHT_MARKER);
      }
    }
  }, [ businessObjects, canvas, elementRegistry ]);

  const clearHighlight = useCallback(() => {
    for (const bo of businessObjects) {
      if (is(bo, 'bpmn:Process')) {
        continue;
      }

      const element = elementRegistry.get(bo.id);

      if (element) {
        canvas.removeMarker(element, HIGHLIGHT_MARKER);
      }
    }
  }, [ businessObjects, canvas, elementRegistry ]);

  return { highlight, clearHighlight };
}
