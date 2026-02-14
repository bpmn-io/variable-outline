// eslint-disable-next-line no-unused-vars
import React, { useContext } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import useService from '../../hooks/useService';
import { FilterContext } from '../../Context/FilterContext';

export default function ElementEntry({ element: bo }) {

  const [ , setFilter ] = useContext(FilterContext);
  const selection = useService('selection');
  const canvas = useService('canvas');
  const elementRegistry = useService('elementRegistry');

  const selectedElements = selection.get();
  const isSelected = selectedElements.some(el => el.id === bo.id);

  const handleClick = () => {
    if (is(bo, 'bpmn:Process')) {
      selection.select([]);
      setFilter(prev => ({ ...prev, selectedElements: [] }));
      return;
    }

    const element = elementRegistry.get(bo.id);

    if (!element) {
      return;
    }

    canvas.scrollToElement(element);
    selection.select(element);
  };

  return (
    <button
      className={ `variable-element-entry${isSelected ? ' variable-element-entry--selected' : ''}` }
      onClick={ handleClick }
    >
      { bo.name || bo.label || bo.id }
    </button>
  );
}
