import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

import CamundaCloudModeler from 'camunda-bpmn-js/dist/camunda-cloud-modeler.development.js';

import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from './diagram.xml?raw';
import { getVariables, useVariables } from '../useVariables';
import useFilter from '../useFilter';
import { FilterProvider } from '../../context/FilterContext';
import { InjectorContext } from '../../context/InjectorContext';


describe('#getVariables', () => {

  beforeEach(bootstrapModeler(diagramXML));

  it('should provide variables', inject(async (variableResolver, selection) => {

    // given
    const filter = {
      search: '',
      selectedElementIds: [],
      writtenOnly: false
    };

    // when
    const { rawVariables, availableVariables, filteredVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(rawVariables).to.have.length(4); // All variables
    expect(filteredVariables).to.have.length(4); // Variables filtered by search
    expect(availableVariables).to.have.length(2); // Variables available for selection

    expect(availableVariables.map(v => v.name)).not.to.include('localVariable');
  }));


  it('should filter for search terms', inject(async (variableResolver, selection) => {

    // given
    const filter = {
      search: 'localVariable',
      selectedElementIds: [],
      writtenOnly: false
    };

    // when
    const { rawVariables, availableVariables, filteredVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(rawVariables).to.have.length(4); // All variables
    expect(filteredVariables).to.have.length(2); // variables filtered by search
    expect(availableVariables).to.have.length(0); // no variable available for selection
  }));


  it('should filter for selection', inject(async (elementRegistry, variableResolver, selection) => {

    // given
    const task = elementRegistry.get('Task_1');
    selection.select(task);

    const filter = {
      search: '',
      selectedElementIds: [],
      writtenOnly: false
    };

    // when
    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(availableVariables).to.have.length(3);
    expect(availableVariables.map(v => v.name)).to.include('localVariable');
  }));


  it('should filter for written only', inject(async (elementRegistry, variableResolver, selection) => {

    // given
    const task = elementRegistry.get('Task_1');
    selection.select(task);

    const filter = {
      search: '',
      selectedElementIds: [],
      writtenOnly: true
    };

    // when
    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(availableVariables).to.have.length(3);
    expect(availableVariables.map(v => v.name)).to.include('localVariable');
    expect(availableVariables.map(v => v.name)).to.include('Task1Variable');
    expect(availableVariables.map(v => v.name)).to.include('Task2Variable');
    expect(availableVariables.map(v => v.name)).not.to.include('localVariable2');
  }));


  it('should filter for multi-select', inject(async (elementRegistry, variableResolver, selection) => {

    // given
    const task1 = elementRegistry.get('Task_1');
    const task2 = elementRegistry.get('Task_2');
    selection.select([ task1, task2 ]);

    const filter = {
      search: '',
      selectedElementIds: [ 'Task_1', 'Task_2' ],
      writtenOnly: true
    };

    // when
    const { rawVariables, availableVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(rawVariables).to.have.length(4); // All variables
    expect(availableVariables).to.have.length(4);
    expect(availableVariables.map(v => v.name)).to.include('localVariable');
    expect(availableVariables.map(v => v.name)).to.include('localVariable2');
    expect(availableVariables.map(v => v.name)).to.include('Task1Variable');
    expect(availableVariables.map(v => v.name)).to.include('Task2Variable');
  }));

});


describe('#useVariables hook sync behavior', () => {

  beforeEach(bootstrapModeler(diagramXML));

  it('should sync single selection to filter and recompute scoped variables', inject(async (elementRegistry, selection, injector) => {

    // given
    const { result } = renderHook(() => ({
      variables: useVariables(),
      filter: useFilter()
    }), { wrapper: createHookWrapper(injector) });

    const task1 = elementRegistry.get('Task_1');

    // when
    await act(() => {
      selection.select(task1);
    });

    // then
    await waitFor(() => {
      expect(result.current.filter.selectedElementIds).to.eql([ 'Task_1' ]);
      expect(result.current.variables.availableVariables.map(v => v.name)).to.include('localVariable');
      expect(result.current.variables.availableVariables.map(v => v.name)).not.to.include('localVariable2');
    });
  }));

  it('should sync multi selection to filter and include both local scopes', inject(async (elementRegistry, selection, injector) => {

    // given
    const { result } = renderHook(() => ({
      variables: useVariables(),
      filter: useFilter()
    }), { wrapper: createHookWrapper(injector) });

    const task1 = elementRegistry.get('Task_1');
    const task2 = elementRegistry.get('Task_2');

    // when
    await act(() => {
      selection.select([ task1, task2 ]);
    });

    // then
    await waitFor(() => {
      const availableVariableNames = result.current.variables.availableVariables.map(v => v.name);

      expect(result.current.filter.selectedElementIds).to.eql([ 'Task_1', 'Task_2' ]);
      expect(availableVariableNames).to.include('localVariable');
      expect(availableVariableNames).to.include('localVariable2');
    });
  }));

  it('should clear selected elements and fall back to process scope on empty selection', inject(async (elementRegistry, selection, injector) => {

    // given
    const { result } = renderHook(() => ({
      variables: useVariables(),
      filter: useFilter()
    }), { wrapper: createHookWrapper(injector) });

    const task1 = elementRegistry.get('Task_1');
    await act(() => {
      selection.select(task1);
    });

    // when
    await act(() => {
      selection.select([]);
    });

    // then
    await waitFor(() => {
      const availableVariableNames = result.current.variables.availableVariables.map(v => v.name);

      expect(result.current.filter.selectedElementIds).to.eql([]);
      expect(availableVariableNames).to.include('Task1Variable');
      expect(availableVariableNames).to.include('Task2Variable');
      expect(availableVariableNames).not.to.include('localVariable');
      expect(availableVariableNames).not.to.include('localVariable2');
    });
  }));

  it('should apply writtenOnly with synced selection ids', inject(async (elementRegistry, selection, injector) => {

    // given
    const { result } = renderHook(() => ({
      variables: useVariables(),
      filter: useFilter()
    }), { wrapper: createHookWrapper(injector) });

    const task2 = elementRegistry.get('Task_2');

    // when
    await act(() => {
      result.current.filter.toggleWrittenOnly();
      selection.select(task2);
    });

    // then
    await waitFor(() => {
      const availableVariableNames = result.current.variables.availableVariables.map(v => v.name);

      expect(result.current.filter.selectedElementIds).to.eql([ 'Task_2' ]);
      expect(availableVariableNames).to.include('Task2Variable');
      expect(availableVariableNames).to.include('localVariable2');
      expect(availableVariableNames).not.to.include('Task1Variable');
      expect(availableVariableNames).not.to.include('localVariable');
    });
  }));
});


// helpers /////////////////////////

function bootstrapModeler(diagram) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram);
}

function createHookWrapper(injector) {
  return function HookWrapper({ children }) {
    return (
      <InjectorContext.Provider value={ injector }>
        <FilterProvider>
          { children }
        </FilterProvider>
      </InjectorContext.Provider>
    );
  };
}
