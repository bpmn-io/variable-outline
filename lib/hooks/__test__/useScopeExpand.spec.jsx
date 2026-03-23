import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import CamundaCloudModeler from 'camunda-bpmn-js/dist/camunda-cloud-modeler.development.js';

import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from './diagram.xml?raw';
import useScopeExpand from '../useScopeExpand';
import { InjectorContext } from '../../context/InjectorContext';
import { ScopeExpandProvider } from '../../context/ScopeExpandContext';


describe('#useScopeExpand tracking', () => {

  beforeEach(bootstrapModeler(diagramXML));

  it('should track collapseScope when collapsing an expanded scope', inject((injector) => {

    // given
    const trackSpy = vi.fn();
    const { result } = renderHook(
      () => useScopeExpand('scope-1', true),
      { wrapper: createWrapper(injector, trackSpy) }
    );

    // when
    act(() => {
      result.current[1]();
    });

    // then
    expect(trackSpy).toHaveBeenCalledWith({
      name: 'variableOutline:collapseScope',
      data: undefined
    });
  }));


  it('should track expandScope when expanding a collapsed scope', inject((injector) => {

    // given
    const trackSpy = vi.fn();
    const { result } = renderHook(
      () => useScopeExpand('scope-1', false),
      { wrapper: createWrapper(injector, trackSpy) }
    );

    // when
    act(() => {
      result.current[1]();
    });

    // then
    expect(trackSpy).toHaveBeenCalledWith({
      name: 'variableOutline:expandScope',
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

  return function HookWrapper({ children }) {
    return (
      <InjectorContext.Provider value={ trackingInjector }>
        <ScopeExpandProvider>
          { children }
        </ScopeExpandProvider>
      </InjectorContext.Provider>
    );
  };
}
