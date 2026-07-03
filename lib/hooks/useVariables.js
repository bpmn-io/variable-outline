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

  // consumed-only records also exist for written variables; only
  // never-written names count as external references
  const writtenNames = new Set(
    rawVariables.filter(variable => variable.scope && variable.origin).map(variable => variable.name)
  );

  const filteredVariables = rawVariables
    .filter(variable => (variable.scope && variable.origin)
      || (isExternalReference(variable) && !writtenNames.has(variable.name)))
    .filter(searchFilter(filter.search));

  const availableVariables = filteredVariables
    .filter(scopeFilter(canvasSelection))
    .filter(writtenOnlyFilter(filter.writtenOnly, filter.selectedElementIds));

  return { rawVariables, filteredVariables, availableVariables };
};


// referenced in the diagram, but never written; provided at runtime
export const isExternalReference = variable => !variable.scope
  && !variable.origin?.length
  && (variable.usedBy || []).some(el => el && el.id);


const writtenOnlyFilter = (writtenOnly, selectedElementIds) => {
  if (!writtenOnly) {
    return () => true;
  }

  const isReadBy = (variable, ids) => variable.usedBy?.some(
    el => el && el.id && (!ids || ids.includes(el.id))
  );

  if (!selectedElementIds || !selectedElementIds.length) {
    return variable => variable.origin?.length > 0 || isReadBy(variable);
  }

  return variable => {
    return variable.origin?.some(origin => selectedElementIds.includes(origin.id))
      || isReadBy(variable, selectedElementIds);
  };
};

const scopeFilter = elements => {
  const allScopeIds = elements.flatMap(element => {
    const bo = getBusinessObject(element);
    return getParents(bo).map(parent => parent.processRef ? parent.processRef.id : parent.id);
  });

  return variable => {

    // external references are diagram-global
    if (!variable.scope) {
      return true;
    }

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
    variable.origin?.find(element => {
      return element.name?.toLowerCase().includes(search) || element.id.toLowerCase().includes(search);
    })
  ) {
    return true;
  }

  // Filter Scope
  if (
    variable.scope && (
      variable.scope.name?.toLowerCase().includes(search) || variable.scope.id.toLowerCase().includes(search)
    )
  ) {
    return true;
  }

  return false;
};
