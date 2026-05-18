import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import useContextMenuBehavior from '../useContextMenuBehavior';
import { InjectorContext } from '../../context/InjectorContext';

vi.mock('../../components/CodeMirrorEditor/treeUtils', () => ({
  getLineContext: vi.fn(() => ({
    propertyNode: {},
    valueNode: {}
  })),
  buildPathFromSyntaxNode: vi.fn(() => '.foo'),
  extractValue: vi.fn(() => '"bar"')
}));


describe('#useContextMenuBehavior tracking', () => {

  it('should track variablePathCopy when copying path', () => {

    // given
    const trackSpy = vi.fn();

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      configurable: true
    });

    const menuState = { anchorPos: 0, rect: { bottom: 0, right: 0 } };
    const view = createMockView();
    const onClose = vi.fn();

    const { result } = renderHook(
      () => useContextMenuBehavior({ menuState, view, rootVariableName: 'myVar', onClose }),
      { wrapper: createWrapper(trackSpy) }
    );

    // when
    act(() => {
      result.current.copyPath();
    });

    // then
    expect(trackSpy).toHaveBeenCalledWith({
      name: 'variableOutline:variablePathCopy',
      data: undefined
    });
  });


  it('should track variableValueCopy when copying value', () => {

    // given
    const trackSpy = vi.fn();

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      configurable: true
    });

    const menuState = { anchorPos: 0, rect: { bottom: 0, right: 0 } };
    const view = createMockView();
    const onClose = vi.fn();

    const { result } = renderHook(
      () => useContextMenuBehavior({ menuState, view, rootVariableName: 'myVar', onClose }),
      { wrapper: createWrapper(trackSpy) }
    );

    // when
    act(() => {
      result.current.copyValue();
    });

    // then
    expect(trackSpy).toHaveBeenCalledWith({
      name: 'variableOutline:variableValueCopy',
      data: undefined
    });
  });

});


// helpers /////////////////////////

function createMockView() {
  return { state: { doc: {} } };
}

function createWrapper(trackSpy) {
  const mockInjector = {
    get: (name) => {
      if (name === 'bpmnJSTracking') {
        return { track: trackSpy };
      }
      return null;
    }
  };

  return function TestWrapper({ children }) {
    return (
      <InjectorContext.Provider value={ mockInjector }>
        { children }
      </InjectorContext.Provider>
    );
  };
}
