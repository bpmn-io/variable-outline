import useElementNavigation from '../../hooks/useElementNavigation';
import { getName } from '../../utils/elementUtil';

export default function ElementEntry({ element: bo, inline = false }) {
  const { isSelected, navigate } = useElementNavigation(bo);

  return (
    <button
      className={ `variable-element-entry${inline ? ' variable-element-entry--inline' : ''}${isSelected ? ' variable-element-entry--selected' : ''}` }
      onClick={ navigate }
      type="button"
    >
      { getName(bo) }
    </button>
  );
}
