import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

import CamundaCloudModeler from 'camunda-bpmn-js/dist/camunda-cloud-modeler.development.js';

import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from '../../hooks/__test__/diagram.xml?raw';
import useFilter from '../../hooks/useFilter';
import { FilterProvider } from '../FilterContext';
import { InjectorContext } from '../InjectorContext';


describe('lib/context/FilterContext', () => {

  beforeEach(bootstrapModeler(diagramXML));

  it('should expose default filter state', inject(async (injector) => {

    // when
    const { result } = renderHook(() => useFilter(), { wrapper: createHookWrapper(injector) });

    // then
    await waitFor(() => {
      expect(result.current.search).to.eql('');
      expect(result.current.writtenOnly).to.eql(false);
      expect(result.current.selectedElementIds).to.eql([]);
      expect(result.current.setSearch).to.be.a('function');
      expect(result.current.toggleWrittenOnly).to.be.a('function');
    });
  }));

  it('should update search via setSearch', inject(async (injector) => {

    // given
    const { result } = renderHook(() => useFilter(), { wrapper: createHookWrapper(injector) });

    await waitFor(() => {
      expect(result.current.setSearch).to.be.a('function');
    });

    // when
    await act(() => {
      result.current.setSearch('MySearch');
    });

    // then
    await waitFor(() => {
      expect(result.current.search).to.eql('MySearch');
    });
  }));

  it('should enable writtenOnly via toggleWrittenOnly', inject(async (injector) => {

    // given
    const { result } = renderHook(() => useFilter(), { wrapper: createHookWrapper(injector) });

    await waitFor(() => {
      expect(result.current.toggleWrittenOnly).to.be.a('function');
    });

    // when
    await act(() => {
      result.current.toggleWrittenOnly();
    });

    // then
    await waitFor(() => {
      expect(result.current.writtenOnly).to.eql(true);
    });
  }));

  it('should disable writtenOnly via toggleWrittenOnly', inject(async (injector) => {

    // given
    const { result } = renderHook(() => useFilter(), { wrapper: createHookWrapper(injector) });

    await waitFor(() => {
      expect(result.current.toggleWrittenOnly).to.be.a('function');
    });

    await act(() => {
      result.current.toggleWrittenOnly();
    });

    await waitFor(() => {
      expect(result.current.writtenOnly).to.eql(true);
    });

    // when
    await act(() => {
      result.current.toggleWrittenOnly();
    });

    // then
    await waitFor(() => {
      expect(result.current.writtenOnly).to.eql(false);
    });
  }));

  it('should sync selectedElementIds on selection.changed', inject(async (elementRegistry, selection, injector) => {

    // given
    const { result } = renderHook(() => useFilter(), { wrapper: createHookWrapper(injector) });

    // when
    await act(() => {
      selection.select(elementRegistry.get('Task_1'));
    });

    // then
    await waitFor(() => {
      expect(result.current.selectedElementIds).to.eql([ 'Task_1' ]);
    });
  }));

  it('should preserve existing state when selection changes', inject(async (elementRegistry, selection, injector) => {

    // given
    const { result } = renderHook(() => useFilter(), { wrapper: createHookWrapper(injector) });

    await waitFor(() => {
      expect(result.current.toggleWrittenOnly).to.be.a('function');
    });

    // when
    await act(() => {
      result.current.toggleWrittenOnly();
    });

    await act(() => {
      selection.select(elementRegistry.get('Task_1'));
    });

    // then
    await waitFor(() => {
      expect(result.current.writtenOnly).to.eql(true);
      expect(result.current.selectedElementIds).to.eql([ 'Task_1' ]);
    });
  }));
});


function bootstrapModeler(diagram, options) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram, options);
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
