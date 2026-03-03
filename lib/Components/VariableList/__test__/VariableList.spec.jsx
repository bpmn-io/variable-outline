/* global navigator */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { act } from 'react';
import CamundaCloudModeler from 'camunda-bpmn-js/dist/camunda-cloud-modeler.development.js';
import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from './diagram.xml?raw';
import { getVariables } from '../../../hooks/useVariables';
import Variables from '../VariableList';
import { FilterContext } from '../../../Context/FilterContext';
import { InjectorContext } from '../../../Context/InjectorContext';
import { ScopeExpandProvider } from '../../../Context/ScopeExpandContext';

const defaultFilter = {
  search: '',
  filterType: 'all',
  selectedElements: [],
  writtenOnly: false
};

let wrapper;

describe('VariableList', () => {
  beforeEach(bootstrapModeler(diagramXML));

  beforeEach(inject((injector) => { wrapper = createWrapper(injector); }));

  describe('given no element is selected', () => {

    it('renders all output variables in a single global scope group, sorted alphabetically', inject(async (variableResolver, selection, injector) => {

      // when
      const { availableVariables } = await getVariables({ variableResolver, selection, filter: defaultFilter });
      const { container } = render(
        <Variables variables={ availableVariables } />,
        { wrapper }
      );

      // then
      expect(getScopeVariables(container)).to.eql([
        {
          scopeName: 'TestDiagram',
          variables: [
            'InnerSubprocessOutputVariable1',
            'InnerSubprocessStartEventOutputVariable1',
            'InnerSubprocessStartEventOutputVariable2',
            'OuterSubprocessOutputVariable1',
            'OuterSubprocessStartEventVariable1',
            'ProcessStartEventOutputVariable1',
            'ProcessStartEventOutputVariable2',
            'ServiceTaskOutputVariable1',
            'ServiceTaskOutputVariable2',
          ],
        }
      ]);
    }));

  });

  describe('given OuterSubprocess is selected', () => {

    it('shows global scope and OuterSubprocess local scope as separate groups', inject(async (elementRegistry, variableResolver, selection, injector) => {

      // given
      selection.select(elementRegistry.get('OuterSubprocess'));

      // when
      const filter = { ...defaultFilter, selectedElements: [ 'OuterSubprocess' ] };
      const { availableVariables } = await getVariables({ variableResolver, selection, filter });
      const { container } = render(
        <Variables variables={ availableVariables } />,
        { wrapper: createWrapper(injector, filter) }
      );

      // then - global scope first, then OuterSubprocess local scope with input-mapped variables
      expect(getScopeVariables(container)).to.eql([
        {
          scopeName: 'TestDiagram',
          variables: [
            'InnerSubprocessOutputVariable1',
            'InnerSubprocessStartEventOutputVariable1',
            'InnerSubprocessStartEventOutputVariable2',
            'OuterSubprocessOutputVariable1',
            'OuterSubprocessStartEventVariable1',
            'ProcessStartEventOutputVariable1',
            'ProcessStartEventOutputVariable2',
            'ServiceTaskOutputVariable1',
            'ServiceTaskOutputVariable2',
          ],
        },
        {
          scopeName: 'OuterSubprocess',
          variables: [ 'OuterSubprocessInputVariable1' ],
        }
      ]);

    }));

  });


  describe('given ServiceTask is selected', () => {

    it('shows one scope group per ancestor scope plus a local scope group, ordered shallow-to-deep', inject(async (elementRegistry, variableResolver, selection, injector) => {

      // given
      selection.select(elementRegistry.get('ServiceTask'));

      // when
      const filter = { ...defaultFilter, selectedElements: [ 'ServiceTask' ] };
      const { availableVariables } = await getVariables({ variableResolver, selection, filter });
      const { container } = render(
        <Variables variables={ availableVariables } />,
        { wrapper: createWrapper(injector, filter) }
      );

      // then - global / OuterSubprocess parent / InnerSubprocess parent / ServiceTask local
      expect(getScopeVariables(container)).to.eql([
        {
          scopeName: 'TestDiagram',
          variables: [
            'InnerSubprocessOutputVariable1',
            'InnerSubprocessStartEventOutputVariable1',
            'InnerSubprocessStartEventOutputVariable2',
            'OuterSubprocessOutputVariable1',
            'OuterSubprocessStartEventVariable1',
            'ProcessStartEventOutputVariable1',
            'ProcessStartEventOutputVariable2',
            'ServiceTaskOutputVariable1',
            'ServiceTaskOutputVariable2',
          ],
        },
        {
          scopeName: 'OuterSubprocess',
          variables: [],
        },
        {
          scopeName: 'InnerSubprocess',
          variables: [],
        },
        {
          scopeName: 'ServiceTask',
          variables: [ 'ServiceTaskInputVariable1', 'ServiceTaskInputVariable2' ],
        }
      ]);
    }));
  });

  describe('variable row interaction', () => {

    it('expands a row on click to reveal Written by details', inject(async (variableResolver, selection, injector) => {

      // given
      const { availableVariables } = await getVariables({ variableResolver, selection, filter: defaultFilter });
      const { container } = render(
        <Variables variables={ availableVariables } />,
        { wrapper }
      );

      // when
      act(() => {
        fireEvent.click(container.querySelector('.variable-row-header'));
      });

      // then
      expect(container.querySelector('.variable-row-details')).to.exist;
      expect(container.textContent).to.include('Written by');
      expect(container.textContent).to.include('ProcessStartEvent');
    }));

    it('copies variable name to clipboard and updates button state', inject(async (variableResolver, selection, injector) => {

      // given
      const clipboardWrite = vi.fn(() => Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: clipboardWrite },
        configurable: true,
      });

      const { availableVariables } = await getVariables({ variableResolver, selection, filter: defaultFilter });
      const { container } = render(
        <Variables variables={ availableVariables } />,
        { wrapper }
      );

      const copyButton = container.querySelector('.variable-copy-button');
      const firstVariableName = container.querySelector('.variable-name').textContent;

      // when
      await act(async () => {
        fireEvent.click(copyButton);
      });

      // then
      expect(clipboardWrite).toHaveBeenCalledWith(firstVariableName);
      expect(copyButton.className).to.include('variable-copy-button--copied');
      expect(copyButton.title).to.eql('Copied!');
    }));

  });

});


// helpers /////////////////////////

function bootstrapModeler(diagram, options) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram, options);
}

const getScopeVariables = (container) => {
  return Array.from(container.querySelectorAll('.variable-scope-group')).map(group => ({
    scopeName: group.querySelector('.variable-section-name')?.textContent,
    variables: Array.from(group.querySelectorAll('.variable-name')).map(n => n.textContent),
  }));
};

const createWrapper = (injector, filter = defaultFilter) => ({ children }) => (
  <InjectorContext.Provider value={ injector }>
    <FilterContext.Provider value={ [ filter, () => {} ] }>
      <ScopeExpandProvider>
        { children }
      </ScopeExpandProvider>
    </FilterContext.Provider>
  </InjectorContext.Provider>
);
