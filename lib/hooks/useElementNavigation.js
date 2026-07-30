import { useCallback } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import useService from './useService';
import { getDefinitionPath } from '../utils/definitionPath';

export default function useElementNavigation(businessObject, options = {}) {
  const { variableName } = options;

  const selection = useService('selection');
  const canvas = useService('canvas');
  const elementRegistry = useService('elementRegistry');
  const eventBus = useService('eventBus');

  // optional: without a properties panel we navigate without revealing
  const propertiesPanel = useService('propertiesPanel', false);

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

    if (!variableName) {
      return;
    }

    const entryId = resolveEntryId(propertiesPanel, element, getDefinitionPath(element, variableName));

    if (!entryId) {
      return;
    }

    // defer so the properties panel re-renders for the newly selected element
    // (and its entries mount) before we ask it to reveal the entry
    setTimeout(() => eventBus.fire('propertiesPanel.showEntry', { id: entryId }), 0);
  }, [ businessObject, variableName, selection, canvas, elementRegistry, eventBus, propertiesPanel ]);

  return { isSelected, navigate };
}

/**
 * Ask the properties panel which entry renders the given moddle path.
 *
 * Returns null when there is no panel, when it is too old to resolve paths, or
 * when every provider defers - we then navigate without revealing.
 *
 * @param {Object} [propertiesPanel]
 * @param {djs.model.Base} element
 * @param {Array<string|number>|null} path
 *
 * @returns {string|null}
 */
function resolveEntryId(propertiesPanel, element, path) {
  if (!path || !propertiesPanel || typeof propertiesPanel.getEntryId !== 'function') {
    return null;
  }

  return propertiesPanel.getEntryId(element, path) || null;
}
