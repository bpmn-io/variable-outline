import { useContext } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import useService from '../../hooks/useService';
import { getName } from '../../utils/elementUtil';
import { FilterContext } from '../../Context/FilterContext';

export default function ElementEntry({ element: bo, inline = false }) {

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
      className={ `variable-element-entry${inline ? ' variable-element-entry--inline' : ''}${isSelected ? ' variable-element-entry--selected' : ''}` }
      onClick={ handleClick }
    >
      { getName(bo) }
    </button>
  );
}
