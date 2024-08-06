import { expect, it } from 'vitest';
import VariableTable from '../VariableTable';
import { FilterContext } from '../../../Context/FilterContext';
import { render } from '@testing-library/react';
import { act } from 'react';
import { InjectorContext } from '../../../Context/InjectorContex';

const wrapper = ({ children }) => <InjectorContext.Provider value={ { get: () => {} } }>
  <FilterContext.Provider value={ [ {}, () => {} ] }>
    {children}
  </FilterContext.Provider>
</InjectorContext.Provider>;

const variables = [
  {
    name: 'A',
    detail: 'B',
    scope: { id: 'C' },
    origin: [ { id: 'D' } ],
  },
  {
    name: 'B',
    detail: 'C',
    scope: { id: 'D' },
    origin: [ { id: 'A' } ],
  },
  {
    name: 'C',
    detail: 'D',
    scope: { id: 'A' },
    origin: [ { id: 'B' } ],
  },
  {
    name: 'D',
    detail: 'A',
    scope: { id: 'B' },
    origin: [ { id: 'C' } ],
  },
];


it('should render', async () => {

  // given
  const { container } = render(<VariableTable variables={ variables } />, { wrapper });

  // then
  // should render all variables
  const variableNodes = getVariableOrder(container);

  expect(variableNodes).to.eql([ 'A', 'B', 'C', 'D' ]);
});


it('should sort by name', async () => {

  // given
  const { container } = render(<VariableTable variables={ variables } />, { wrapper });

  const nameSortButton = container.querySelector('thead th:nth-child(1) button');

  // when
  await act(async () => {
    nameSortButton.click();
  });

  // then
  // should sort ascending
  let variableNodes = getVariableOrder(container);
  expect(variableNodes).to.eql([ 'A', 'B', 'C', 'D' ]);


  // when
  await act(async () => {
    nameSortButton.click();
  });

  // then
  // should sort descending
  variableNodes = getVariableOrder(container);
  expect(variableNodes).to.eql([ 'D', 'C', 'B', 'A' ]);
});


it('should sort by Type', async () => {

  // given
  const { container } = render(<VariableTable variables={ variables } />, { wrapper });

  const typeSortButton = container.querySelector('thead th:nth-child(2) button');

  // when
  await act(async () => {
    typeSortButton.click();
  });

  // then
  // should sort ascending
  let variableNodes = getVariableOrder(container);
  expect(variableNodes).to.eql([ 'D', 'A', 'B', 'C' ]);


  // when
  await act(async () => {
    typeSortButton.click();
  });

  // then
  // should sort descending
  variableNodes = getVariableOrder(container);
  expect(variableNodes).to.eql([ 'C', 'B', 'A', 'D' ]);
});


it('should sort by Scope', async () => {

  // given
  const { container } = render(<VariableTable variables={ variables } />, { wrapper });

  const scopeSortButton = container.querySelector('thead th:nth-child(3) button');

  // when
  await act(async () => {
    scopeSortButton.click();
  });

  // then
  // should sort ascending
  let variableNodes = getVariableOrder(container);
  expect(variableNodes).to.eql([ 'C', 'D', 'A', 'B' ]);


  // when
  await act(async () => {
    scopeSortButton.click();
  });

  // then
  // should sort descending
  variableNodes = getVariableOrder(container);
  expect(variableNodes).to.eql([ 'B', 'A', 'D', 'C', ]);
});


it('should sort by Origin', async () => {

  // given
  const { container } = render(<VariableTable variables={ variables } />, { wrapper });

  const scopeSortButton = container.querySelector('thead th:nth-child(4) button');

  // when
  await act(async () => {
    scopeSortButton.click();
  });

  // then
  // should sort ascending
  let variableNodes = getVariableOrder(container);
  expect(variableNodes).to.eql([ 'B', 'C', 'D', 'A' ]);


  // when
  await act(async () => {
    scopeSortButton.click();
  });

  // then
  // should sort descending
  variableNodes = getVariableOrder(container);
  expect(variableNodes).to.eql([ 'A', 'D', 'C', 'B' ]);
});

// helper
function getVariableOrder(container) {
  return Array.from(container.querySelectorAll('tbody tr td:first-child')).map(node => node.textContent);
}