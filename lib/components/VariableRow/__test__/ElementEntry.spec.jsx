import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import ElementEntry from '../ElementEntry';
import { InjectorContext } from '../../../context/InjectorContext';


describe('ElementEntry', () => {

  describe('hover highlighting', () => {

    it('should highlight element on mouse enter', () => {

      // given
      const element = { id: 'Task_1' };
      const addMarker = vi.fn();
      const { container } = renderElementEntry(element, { addMarker });

      // when
      fireEvent.mouseEnter(container.querySelector('button'));

      // then
      expect(addMarker).toHaveBeenCalledWith(element, 'bio-vo-highlight');
    });

    it('should clear highlight on mouse leave', () => {

      // given
      const element = { id: 'Task_1' };
      const removeMarker = vi.fn();
      const { container } = renderElementEntry(element, { removeMarker });

      // when
      fireEvent.mouseLeave(container.querySelector('button'));

      // then
      expect(removeMarker).toHaveBeenCalledWith(element, 'bio-vo-highlight');
    });

    it('should not highlight bpmn:Process element', () => {

      // given
      const bo = {
        id: 'Process_1',
        $instanceOf: (type) => type === 'bpmn:Process'
      };
      const addMarker = vi.fn();
      const { container } = renderElementEntry(bo, { addMarker });

      // when
      fireEvent.mouseEnter(container.querySelector('button'));

      // then
      expect(addMarker).not.toHaveBeenCalled();
    });

    it('should clear highlight on unmount while hovered', () => {

      // given
      const element = { id: 'Task_1' };
      const removeMarker = vi.fn();
      const { container, unmount } = renderElementEntry(element, { removeMarker });
      fireEvent.mouseEnter(container.querySelector('button'));

      // when
      unmount();

      // then
      expect(removeMarker).toHaveBeenCalledWith(element, 'bio-vo-highlight');
    });

    it('should highlight selected element on mouse enter', () => {

      // given
      const bo = { id: 'Task_1' };
      const addMarker = vi.fn();
      const { container } = renderElementEntry(bo, { addMarker, selectedIds: [ 'Task_1' ] });

      // when
      fireEvent.mouseEnter(container.querySelector('span.variable-element-entry'));

      // then
      expect(addMarker).toHaveBeenCalledWith({ id: 'Task_1' }, 'bio-vo-highlight');
    });

  });

});


// helpers /////////////////////////

function renderElementEntry(bo, { addMarker = vi.fn(), removeMarker = vi.fn(), selectedIds = [] } = {}) {
  const registryElement = { id: bo.id };

  const mockInjector = {
    get: (service) => {
      const services = {
        selection: { get: () => selectedIds.map(id => ({ id })) },
        canvas: {
          scrollToElement: () => {},
          addMarker,
          removeMarker
        },
        elementRegistry: { get: (id) => id === bo.id ? registryElement : null }
      };
      return services[service];
    }
  };

  return render(
    <InjectorContext.Provider value={ mockInjector }>
      <ElementEntry element={ bo } />
    </InjectorContext.Provider>
  );
}
