import { expect, it } from 'vitest';

import { render } from '@testing-library/react';

import Origin from '../Origin';
import { InjectorContext } from '../../../Context/InjectorContex';


const wrapper = ({ children }) => <InjectorContext.Provider value={ { get: () => {} } }>{children}</InjectorContext.Provider>;


it('should show origin', () => {

  // given
  const origins = [ { id: 'Origin_1' } ];

  const { container } = render(<Origin origins={ origins } />, { wrapper });


  // then
  const nodes = getNodes(container);
  expect(nodes).to.eql([ 'Origin_1' ]);
});


it('should show multiple origins', () => {

  // given
  const origins = [ { id: 'Origin_1' }, { id: 'Origin_2' } ];

  const { container } = render(<Origin origins={ origins } />, { wrapper });


  // then
  const nodes = getNodes(container);
  expect(nodes).to.eql([ 'Origin_1', 'Origin_2' ]);
});


it('should truncate additional origins', () => {

  // given
  const origins = [ { id: 'Origin_1' }, { id: 'Origin_2' }, { id: 'Origin_3' }, { id: 'Origin_4' } ];

  const { container } = render(<Origin origins={ origins } />, { wrapper });


  // then
  const nodes = getNodes(container);
  expect(nodes).to.eql([ 'Origin_1', 'Origin_2', '+2' ]);
});


// helper
function getNodes(container) {
  return Array.from(container.querySelectorAll('.bio-vo-origin > *')).map(node => node.textContent);
}