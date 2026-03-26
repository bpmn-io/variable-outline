import { useCallback, useEffect, useState } from 'react';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import useFilter from './useFilter';
import useService from './useService';
import { getParents } from '../utils/elementUtil';

export function useVariables() {
  const VARIABLE_UPDATE_EVENTS = [ 'commandStack.changed', 'import.done' ];

  const bpmnJS = useService('bpmnjs');
  const variableResolver = useService('variableResolver');
  const eventBus = useService('eventBus');
  const selection = useService('selection');

  const [ result, setResult ] = useState({ rawVariables: [], filteredVariables: [], availableVariables: [] });
  const filter = useFilter();

  const updateVariables = useCallback(() => {
    bpmnJS.getDefinitions() && getVariables({ variableResolver, selection, filter }).then(setResult);
  }, [ variableResolver, selection, filter, bpmnJS ]);


  useEffect(() => {
    eventBus.on(VARIABLE_UPDATE_EVENTS, updateVariables);
    updateVariables();

    return () => {
      eventBus.off(VARIABLE_UPDATE_EVENTS, updateVariables);
    };
  }, [ eventBus, updateVariables ]);


  useEffect(() => {
    updateVariables();
  }, [ filter, updateVariables ]);

  return result;
}


export const getVariables = async ({ variableResolver, selection, filter }) => {
  const canvasSelection = selection.get();

  // Variable resolver already caches the result, we do not need to care about calls without changes here
  const rawVariables = Object.values(await variableResolver.getVariables()).flat();

  const filteredVariables = rawVariables.filter(searchFilter(filter.search));

  const availableVariables = filteredVariables
    .filter(variable => variable.scope)
    .filter(scopeFilter(canvasSelection))
    .filter(writtenOnlyFilter(filter.writtenOnly, filter.selectedElementIds));

  return { rawVariables, filteredVariables, availableVariables };
};


const writtenOnlyFilter = (writtenOnly, selectedElementIds) => {
  if (!writtenOnly) {
    return () => true;
  }

  if (!selectedElementIds || !selectedElementIds.length) {
    return variable => variable.origin && variable.origin.length > 0;
  }

  return variable => {
    return variable.origin.some(origin => selectedElementIds.includes(origin.id));
  };
};

const scopeFilter = elements => {
  const allScopeIds = elements.flatMap(element => {
    const bo = getBusinessObject(element);
    return getParents(bo).map(parent => parent.processRef ? parent.processRef.id : parent.id);
  });

  return variable => {
    if (!allScopeIds || !allScopeIds.length) {
      return variable.scope?.$type === 'bpmn:Process';
    }

    return allScopeIds.includes(variable.scope?.id);
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
