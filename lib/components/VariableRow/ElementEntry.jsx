import useElementNavigation from '../../hooks/useElementNavigation';
import { getName } from '../../utils/elementUtil';

export default function ElementEntry({ element: bo, inline = false }) {
  const { isSelected, navigate } = useElementNavigation(bo);

  const className = `variable-element-entry${inline ? ' variable-element-entry--inline' : ''}${isSelected ? ' variable-element-entry--selected' : ''}`;

  if (isSelected) {
    return (
      <span className={ className }>
        { getName(bo) }
      </span>
    );
  }

  return (
    <button
      className={ className }
      onClick={ navigate }
      type="button"
    >
      { getName(bo) }
    </button>
  );
}
