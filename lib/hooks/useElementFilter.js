import { useCallback, useContext, useMemo } from 'react';

import { FilterContext } from '../Context/FilterContext';
import useService from './useService';
import { getName } from '../utils/elementUtil';

const EMPTY = [];

export default function useElementFilter(variables) {
  const [ filter, setFilter ] = useContext(FilterContext);
  const elementRegistry = useService('elementRegistry');

  const selectedElements = filter.selectedElements || EMPTY;

  const elements = useMemo(() => {
    const elementMap = new Map();

    variables.forEach(variable => {
      variable.origin?.forEach(origin => {
        if (!elementMap.has(origin.id)) {
          const element = elementRegistry.get(origin.id);
          elementMap.set(origin.id, {
            id: origin.id,
            name: getName(origin),
            variableCount: 0,
            element
          });
        }
        elementMap.get(origin.id).variableCount++;
      });
    });

    selectedElements.forEach(id => {
      if (!elementMap.has(id)) {
        const element = elementRegistry.get(id);
        if (element) {
          elementMap.set(id, {
            id,
            name: getName(element.businessObject) || id,
            variableCount: 0,
            element
          });
        }
      }
    });

    return Array.from(elementMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [ variables, elementRegistry, selectedElements ]);

  const handleToggleElement = useCallback((elementId) => {
    setFilter(prev => {
      const current = prev.selectedElements || [];
      const isSelected = current.includes(elementId);
      const updated = isSelected
        ? current.filter(id => id !== elementId)
        : [ ...current, elementId ];
      return { ...prev, selectedElements: updated };
    });
  }, [ setFilter ]);

  const handleClearAll = useCallback(() => {
    setFilter(prev => ({ ...prev, selectedElements: [] }));
  }, [ setFilter ]);

  const label = selectedElements.length === 1
    ? elements.find(el => el.id === selectedElements[0])?.name || selectedElements[0]
    : selectedElements.length > 1
      ? `${selectedElements.length} elements`
      : 'All elements';

  return { elements, selectedElements, label, handleToggleElement, handleClearAll };
}
