import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { act } from 'react';

import CopyButton from '../CopyButton';
import { InjectorContext } from '../../context/InjectorContext';


describe('#CopyButton tracking', () => {

  it('should track variableNameCopy when clicking copy button', async () => {

    // given
    const trackSpy = vi.fn();

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      configurable: true
    });

    const { container } = render(
      <CopyButton text="myVariable" />,
      { wrapper: createWrapper(trackSpy) }
    );

    // when
    await act(async () => {
      fireEvent.click(container.querySelector('.variable-copy-button'));
    });

    // then
    expect(trackSpy).toHaveBeenCalledWith({
      name: 'variableOutline:variableNameCopy',
      data: undefined
    });
  });

});


// helpers /////////////////////////

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
