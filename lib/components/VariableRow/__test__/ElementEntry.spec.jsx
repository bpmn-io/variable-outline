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
      const { container, registryElement } = renderElementEntry(element, { addMarker });

      // when
      fireEvent.mouseEnter(container.querySelector('button'));

      // then
      expect(addMarker).toHaveBeenCalledWith(registryElement, 'bio-vo-highlight');
    });

    it('should clear highlight on mouse leave', () => {

      // given
      const element = { id: 'Task_1' };
      const removeMarker = vi.fn();
      const { container, registryElement } = renderElementEntry(element, { removeMarker });

      // when
      fireEvent.mouseLeave(container.querySelector('button'));

      // then
      expect(removeMarker).toHaveBeenCalledWith(registryElement, 'bio-vo-highlight');
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
      const { container, registryElement, unmount } = renderElementEntry(element, { removeMarker });
      fireEvent.mouseEnter(container.querySelector('button'));

      // when
      unmount();

      // then
      expect(removeMarker).toHaveBeenCalledWith(registryElement, 'bio-vo-highlight');
    });

    it('should highlight selected element on mouse enter', () => {

      // given
      const bo = { id: 'Task_1' };
      const addMarker = vi.fn();
      const { container, registryElement } = renderElementEntry(bo, { addMarker, selectedIds: [ 'Task_1' ] });

      // when
      fireEvent.mouseEnter(container.querySelector('span.variable-element-entry'));

      // then
      expect(addMarker).toHaveBeenCalledWith(registryElement, 'bio-vo-highlight');
    });

  });


  describe('revealing the defining field', () => {

    it('should reveal the entry the panel resolves for the definition', async () => {

      // given
      const bo = writerBusinessObject('Task_1', 'foo');
      const getEntryId = vi.fn(() => 'custom-entry-123');
      const fire = vi.fn();
      const { container } = renderElementEntry(bo, { variableName: 'foo', getEntryId, fire });

      // when
      fireEvent.click(container.querySelector('button'));
      await flushDeferred();

      // then
      expect(getEntryId).toHaveBeenCalledWith(
        { id: 'Task_1', businessObject: bo },
        [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'target' ]
      );
      expect(fire).toHaveBeenCalledWith('propertiesPanel.showEntry', { id: 'custom-entry-123' });
    });


    it('should not reveal when the panel resolves nothing', async () => {

      // given
      const bo = writerBusinessObject('Task_1', 'foo');
      const fire = vi.fn();
      const { container } = renderElementEntry(bo, {
        variableName: 'foo',
        getEntryId: () => null,
        fire
      });

      // when
      fireEvent.click(container.querySelector('button'));
      await flushDeferred();

      // then
      expect(fire).not.toHaveBeenCalled();
    });


    it('should not reveal without a properties panel', async () => {

      // given
      const bo = writerBusinessObject('Task_1', 'foo');
      const fire = vi.fn();
      const { container } = renderElementEntry(bo, { variableName: 'foo', fire });

      // when
      fireEvent.click(container.querySelector('button'));
      await flushDeferred();

      // then
      expect(fire).not.toHaveBeenCalled();
    });


    it('should not reveal without a variable name', async () => {

      // given
      const bo = writerBusinessObject('Task_1', 'foo');
      const getEntryId = vi.fn(() => 'custom-entry-123');
      const fire = vi.fn();
      const { container } = renderElementEntry(bo, { getEntryId, fire });

      // when
      fireEvent.click(container.querySelector('button'));
      await flushDeferred();

      // then
      expect(getEntryId).not.toHaveBeenCalled();
      expect(fire).not.toHaveBeenCalled();
    });

  });

});


// helpers /////////////////////////

function renderElementEntry(bo, {
  addMarker = vi.fn(),
  removeMarker = vi.fn(),
  selectedIds = [],
  variableName,
  getEntryId,
  fire = vi.fn()
} = {}) {
  const registryElement = { id: bo.id, businessObject: bo };

  const mockInjector = {
    get: (service) => {
      const services = {
        selection: {
          get: () => selectedIds.map(id => ({ id })),
          select: () => {}
        },
        canvas: {
          scrollToElement: () => {},
          addMarker,
          removeMarker
        },
        elementRegistry: { get: (id) => id === bo.id ? registryElement : null },
        eventBus: { fire },
        propertiesPanel: getEntryId ? { getEntryId } : undefined
      };
      return services[service];
    }
  };

  return {
    ...render(
      <InjectorContext.Provider value={ mockInjector }>
        <ElementEntry element={ bo } variableName={ variableName } />
      </InjectorContext.Provider>
    ),
    registryElement
  };
}

function writerBusinessObject(id, target) {
  const outputParameter = { get: key => key === 'target' ? target : undefined };

  const ioMapping = {
    $type: 'zeebe:IoMapping',
    get: key => key === 'outputParameters' ? [ outputParameter ] : undefined
  };

  const extensionElements = { get: key => key === 'values' ? [ ioMapping ] : undefined };

  return {
    id,
    get: key => key === 'extensionElements' ? extensionElements : undefined
  };
}

function flushDeferred() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
