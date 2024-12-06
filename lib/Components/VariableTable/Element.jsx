import { is } from 'bpmn-js/lib/util/ModelUtil';
import useService from '../../hooks/useService';

function Element({ element: bo }) {

  const selection = useService('selection');
  const canvas = useService('canvas');
  const elementRegisty = useService('elementRegistry');

  const handleClick = () => {
    const element = elementRegisty.get(bo.id);

    if (!element || is(element, 'bpmn:Process')) {
      return;
    }

    canvas.scrollToElement(element);
    selection.select(element);
  };

  return <button
    onClick={ handleClick }
    className="bio-vo-text-button bio-vo-element"
  >
    {bo.name || bo.label || bo.id}
  </button>;
}

export default Element;