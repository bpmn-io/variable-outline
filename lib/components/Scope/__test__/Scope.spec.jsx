import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { act } from 'react';

import CamundaCloudModeler from 'camunda-bpmn-js/dist/camunda-cloud-modeler.development.js';

import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from '../../../hooks/__test__/diagram.xml?raw';
import { getVariables } from '../../../hooks/useVariables';
import Scope from '../Scope';
import { InjectorContext } from '../../../context/InjectorContext';
import { ScopeExpandProvider } from '../../../context/ScopeExpandContext';
import { FilterContext } from '../../../context/FilterContext';

const defaultFilter = {
  search: '',
  setSearch: () => {},
  selectedElementIds: [],
  writtenOnly: false,
  toggleWrittenOnly: () => {}
};


describe('#Scope variable tracking', () => {

  beforeEach(bootstrapModeler(diagramXML));

  it('should track expandVariable when expanding a collapsed variable row', inject(async (injector, variableResolver, selection) => {

    // given
    const trackSpy = vi.fn();
    const { availableVariables } = await getVariables({ variableResolver, selection, filter: defaultFilter });
    const scope = availableVariables[0].scope;

    const { container } = render(
      <Scope
        scopeName="TestScope"
        scope={ scope }
        variables={ availableVariables }
        defaultExpanded={ true }
      />,
      { wrapper: createWrapper(injector, trackSpy) }
    );

    // when
    await act(() => {
      fireEvent.click(container.querySelector('.variable-row-toggle'));
    });

    // then
    expect(trackSpy).toHaveBeenCalledWith({
      name: 'variableOutline:expandVariable',
      data: undefined
    });
  }));


  it('should track collapseVariable when collapsing an expanded variable row', inject(async (injector, variableResolver, selection) => {

    // given
    const trackSpy = vi.fn();
    const { availableVariables } = await getVariables({ variableResolver, selection, filter: defaultFilter });
    const scope = availableVariables[0].scope;

    const { container } = render(
      <Scope
        scopeName="TestScope"
        scope={ scope }
        variables={ availableVariables }
        defaultExpanded={ true }
      />,
      { wrapper: createWrapper(injector, trackSpy) }
    );

    const toggle = container.querySelector('.variable-row-toggle');

    // when - expand then collapse
    await act(() => { fireEvent.click(toggle); });
    await act(() => { fireEvent.click(toggle); });

    // then
    expect(trackSpy).toHaveBeenCalledTimes(2);
    expect(trackSpy).toHaveBeenLastCalledWith({
      name: 'variableOutline:collapseVariable',
      data: undefined
    });
  }));

});


// helpers /////////////////////////

function bootstrapModeler(diagram, options) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram, options);
}

function createWrapper(injector, trackSpy) {
  const trackingInjector = {
    get: (name, strict) => {
      if (name === 'bpmnJSTracking') {
        return { track: trackSpy };
      }
      return injector.get(name, strict);
    }
  };

  return function TestWrapper({ children }) {
    return (
      <InjectorContext.Provider value={ trackingInjector }>
        <FilterContext.Provider value={ defaultFilter }>
          <ScopeExpandProvider>
            { children }
          </ScopeExpandProvider>
        </FilterContext.Provider>
      </InjectorContext.Provider>
    );
  };
}
