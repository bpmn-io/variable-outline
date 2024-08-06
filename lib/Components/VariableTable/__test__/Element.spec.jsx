import { act } from 'react';
import { beforeEach, expect, it } from 'vitest';

import { render } from '@testing-library/react';

import CamundaCloudModeler from 'camunda-bpmn-js/dist/camunda-cloud-modeler.development.js';

import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from './diagram.xml?raw';

import Element from '../Element';
import { InjectorContext } from '../../../Context/InjectorContex';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

function bootstrapModeler(diagram, options) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram, options);
}

beforeEach(bootstrapModeler(diagramXML));

let wrapper;
beforeEach(inject(async (injector) => {
  wrapper = ({ children }) => <InjectorContext.Provider value={ injector }>{children}</InjectorContext.Provider>;
}));


it('should select on click', inject(async (elementRegistry, selection) => {

  // given
  const Task1 = elementRegistry.get('Task_1');

  const { container } = render(<Element element={ getBusinessObject(Task1) } />, { wrapper });

  // assume
  const button = container.querySelector('button');
  expect(button).to.exist;
  expect(button.innerText).to.eql('Task 1');

  // when
  await act(async () => {
    button.click();
  });

  // then
  expect(selection.get()).to.eql([ Task1 ]);
}));


it('should scroll to element', inject(async (elementRegistry, canvas) => {

  // given
  const Task1 = elementRegistry.get('Task_1');
  canvas.scroll({ dx: 10000, dy: 0 });

  const { container } = render(<Element element={ getBusinessObject(Task1) } />, { wrapper });
  const button = container.querySelector('button');

  // assume
  const initalViewbox = canvas.viewbox();
  expect(initalViewbox.x).to.be.closeTo(-10000, 100);


  // when
  await act(async () => {
    button.click();
  });

  // then
  const finalViewbox = canvas.viewbox();
  expect(finalViewbox.x).to.be.closeTo(0, 100);
}));


it('should not select process', inject(async (elementRegistry, selection) => {

  // given
  const process = elementRegistry.get('Process_1');

  const { container } = render(<Element element={ getBusinessObject(process) } />, { wrapper });

  // assume
  const button = container.querySelector('button');
  expect(button).to.exist;
  expect(button.innerText).to.eql('Process 1');

  // when
  await act(async () => {
    button.click();
  });

  // then
  expect(selection.get()).to.eql([ ]);
}));
