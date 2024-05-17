import useService from '../../hooks/useService';

import './Element.scss';

function Element({ element: bo }) {

  const selection = useService('selection');
  const elementRegisty = useService('elementRegistry');

  const handleClick = (event) => {
    selection.select(elementRegisty.get(bo.id));
  };

  return <button
    onClick={ handleClick }
    className="bio-vo-text-button bio-vo-element"
  >
    {bo.name || bo.label || bo.id}
  </button>;
}

export default Element;