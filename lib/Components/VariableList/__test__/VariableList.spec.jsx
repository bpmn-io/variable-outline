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

function bootstrapModeler(diagram, options) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram, options);
}

const getVariableNames = (container) => (
  Array.from(container.querySelectorAll('.variable-name')).map(node => node.textContent)
);

const createWrapper = (injector, filter) => ({ children }) => (
  <InjectorContext.Provider value={ injector }>
    <FilterContext.Provider value={ [ filter, () => {} ] }>
      { children }
    </FilterContext.Provider>
  </InjectorContext.Provider>
);

describe('VariableList', () => {
  beforeEach(bootstrapModeler(diagramXML));

  it('renders variables sorted alphabetically', inject(async (variableResolver, selection, injector) => {
    const filter = { search: '', filterType: 'all', selectedElements: [], writtenOnly: false };

    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    const { container } = render(<Variables variables={ availableVariables } />, { wrapper: createWrapper(injector, filter) });

    const names = getVariableNames(container);
    expect(names).to.eql([ 'Task1Variable', 'Task2Variable' ]);
  }));

  it('shows additional variables when selection exists', inject(async (elementRegistry, variableResolver, selection, injector) => {
    const task = elementRegistry.get('Task_1');
    selection.select(task);

    const filter = { search: '', filterType: 'all', selectedElements: [], writtenOnly: false };

    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    const { container } = render(<Variables variables={ availableVariables } />, { wrapper: createWrapper(injector, filter) });

    // Variables are now grouped by scope: process-level variables first, then local scopes
    const names = getVariableNames(container);
    expect(names).to.eql([ 'Task1Variable', 'Task2Variable', 'localVariable' ]);
  }));

  it('expands a variable row on click to show details', inject(async (variableResolver, selection, injector) => {
    const filter = { search: '', filterType: 'all', selectedElements: [], writtenOnly: false };

    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    const { container } = render(<Variables variables={ availableVariables } />, { wrapper: createWrapper(injector, filter) });

    const firstRowHeader = container.querySelector('.variable-row-header');

    act(() => {
      fireEvent.click(firstRowHeader);
    });

    expect(container.querySelector('.variable-row-details')).to.exist;
    expect(container.textContent).to.include('WRITTEN BY');
    expect(container.textContent).to.include('Task 1');
  }));

  it('copies variable name and updates button state', inject(async (variableResolver, selection, injector) => {
    const clipboardWrite = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWrite },
      configurable: true,
    });

    const filter = { search: '', filterType: 'all', selectedElements: [], writtenOnly: false };

    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    const { container } = render(<Variables variables={ availableVariables } />, { wrapper: createWrapper(injector, filter) });
    const copyButton = container.querySelector('.variable-copy-button');
    const firstVariableName = container.querySelector('.variable-name').textContent;

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(clipboardWrite).toHaveBeenCalledWith(firstVariableName);
    expect(copyButton.className).to.include('variable-copy-button--copied');
    expect(copyButton.title).to.eql('Copied!');
  }));

  it('highlights variables used by selected element', inject(async (elementRegistry, variableResolver, selection, injector) => {
    const task = elementRegistry.get('Task_2');
    selection.select(task);

    const filter = { search: '', filterType: 'all', selectedElements: [ 'Task_2' ], writtenOnly: false };

    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    const { container } = render(<Variables variables={ availableVariables } />, { wrapper: createWrapper(injector, filter) });

    // Variables are now grouped by scope, so order reflects scope grouping
    const highlighted = container.querySelectorAll('.variable-row--highlight .variable-name');
    const highlightedNames = Array.from(highlighted).map(node => node.textContent);
    expect(highlightedNames).to.eql([ 'Task2Variable', 'localVariable2' ]);
  }));
});
