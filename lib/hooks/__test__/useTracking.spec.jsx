import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import useTracking from '../useTracking';
import { InjectorContext } from '../../context/InjectorContext';


describe('#useTracking hook', () => {

  it('should call bpmnJSTracking.track with namespaced name and data', () => {

    // given
    const mockService = {
      track: vi.fn()
    };

    const mockInjector = {
      get: (name) => name === 'bpmnJSTracking' ? mockService : null
    };

    const { result } = renderHook(
      () => useTracking(),
      { wrapper: createHookWrapper(mockInjector) }
    );

    // when
    act(() => {
      result.current('test-event', { foo: 'bar' });
    });

    // then
    expect(mockService.track).toHaveBeenCalledWith({
      name: 'variableOutline:test-event',
      data: { foo: 'bar' }
    });
    expect(mockService.track).toHaveBeenCalledTimes(1);
  });


  it('should no-op when bpmnJSTracking service is absent', () => {

    // given
    const mockInjector = {
      get: () => null
    };

    const { result } = renderHook(
      () => useTracking(),
      { wrapper: createHookWrapper(mockInjector) }
    );

    // when / then - should not throw
    expect(() => {
      act(() => {
        result.current('test-event', { foo: 'bar' });
      });
    }).not.toThrow();
  });


  it('should always prepend variableOutline namespace', () => {

    // given
    const mockService = {
      track: vi.fn()
    };

    const mockInjector = {
      get: (name) => name === 'bpmnJSTracking' ? mockService : null
    };

    const { result } = renderHook(
      () => useTracking(),
      { wrapper: createHookWrapper(mockInjector) }
    );

    // when
    act(() => {
      result.current('searched', { cleared: false });
      result.current('scopeToggled', { expanded: true });
    });

    // then
    expect(mockService.track).toHaveBeenCalledTimes(2);
    expect(mockService.track.mock.calls.every(
      ([ { name } ]) => name.startsWith('variableOutline:')
    )).toBe(true);
  });

});


// helpers /////////////////////////

function createHookWrapper(injector) {
  return function HookWrapper({ children }) {
    return (
      <InjectorContext.Provider value={ injector }>
        { children }
      </InjectorContext.Provider>
    );
  };
}
