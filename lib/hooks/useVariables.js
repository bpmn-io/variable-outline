import { useCallback, useContext, useEffect, useState } from 'react';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import useService from './useService';
import { getParents } from '../utils/elementUtil';
import { FilterContext } from '../Context/FilterContext';

export function useVariables() {

  const bpmnJS = useService('bpmnjs');
  const variableResolver = useService('variableResolver');
  const eventBus = useService('eventBus');
  const selection = useService('selection');

  const [ result, setResult ] = useState({ rawVariables: [], filteredVariables: [], availableVariables: [] });
  const [ filter ] = useContext(FilterContext);

  const updateVariables = useCallback(() => {
    bpmnJS.getDefinitions() && getVariables({ variableResolver, selection, filter }).then(setResult);
  }, [ variableResolver, selection, filter, bpmnJS ]);


  useEffect(() => {
    eventBus.on([ 'commandStack.changed', 'import.done', 'selection.changed' ], updateVariables);
    updateVariables();

    return () => {
      eventBus.off([ 'commandStack.changed', 'import.done', 'selection.changed' ], updateVariables);
    };
  }, [ eventBus, updateVariables ]);


  useEffect(() => {
    updateVariables();
  }, [ filter, updateVariables ]);

  return result;
}


export const getVariables = async ({ variableResolver, selection, filter }) => {
  const selectedElements = selection.get();

  // Variable resolver already chaches the result, we do not need to care about calls without changes here
  const rawVariables = Object.values(await variableResolver.getVariables()).flat();

  const filteredVariables = rawVariables.filter(searchFilter(filter.search)) ; // search

  const availableVariables = filteredVariables.filter(scopeFilter(selectedElements))
    .filter(refineFilter(filter, selectedElements));

  return { rawVariables, filteredVariables, availableVariables };
};


const refineFilter = (filter, elements) => {
  const { filterType } = filter;

  switch (filterType) {
  case 'all':
    return () => true;
  case 'origin':
    return originFilter(elements);
  default:
    return () => true;
  }
};

// written in this or child element
const originFilter = elements => {
  if (!elements || !elements.length) {
    return () => true;
  }

  const originIds = elements.map(element => getBusinessObject(element).id);

  return variable => {
    return variable.origin.some(origin => originIds.includes(origin.id));
  };

};

const scopeFilter = elements => {

  const allScopeIds = elements.flatMap(element => {
    const bo = getBusinessObject(element);
    return getParents(bo).map(parent => parent.id);
  });

  return variable => {
    if (!allScopeIds || !allScopeIds.length) {
      return variable.scope.$type === 'bpmn:Process';
    }

    return allScopeIds.includes(variable.scope.id);
  };
};

const searchFilter = search => variable => {

  // No filter
  if (!search) {
    return true;
  }

  search = search.toLowerCase();

  // Filter Variable Name
  if (variable.name?.toLowerCase().includes(search)) {
    return true;
  }

  // Filter Origin
  if (
    variable.origin.find(element => {
      return element.name?.toLowerCase().includes(search) || element.id.toLowerCase().includes(search);
    })
  ) {
    return true;
  }

  // Filter Scope
  if (
    variable.scope.name?.toLowerCase().includes(search) || variable.scope.id.toLowerCase().includes(search)
  ) {
    return true;
  }

  return false;
};