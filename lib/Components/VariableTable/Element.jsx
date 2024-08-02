import { is } from 'bpmn-js/lib/util/ModelUtil';
import useService from '../../hooks/useService';

import './Element.scss';

function Element({ element: bo }) {

  const selection = useService('selection');
  const elementRegisty = useService('elementRegistry');

  const handleClick = () => {
    const element = elementRegisty.get(bo.id);

    if (!element || is(element, 'bpmn:Process')) {
      return;
    }

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