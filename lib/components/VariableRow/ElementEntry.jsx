import { useMemo } from 'react';

import useElementNavigation from '../../hooks/useElementNavigation';
import useElementHighlight from '../../hooks/useElementHighlight';
import { getName } from '../../utils/elementUtil';

export default function ElementEntry({ element: bo, variableName, inline = false }) {
  const { isSelected, navigate } = useElementNavigation(bo, { variableName });

  const elements = useMemo(() => [ bo ], [ bo ]);
  const { highlight, clearHighlight } = useElementHighlight(elements);

  const className = `variable-element-entry${inline ? ' variable-element-entry--inline' : ''}${isSelected ? ' variable-element-entry--selected' : ''}`;

  if (isSelected) {
    return (
      <span
        className={ className }
        onMouseEnter={ highlight }
        onMouseLeave={ clearHighlight }
      >
        { getName(bo) }
      </span>
    );
  }

  return (
    <button
      className={ className }
      onClick={ navigate }
      onMouseEnter={ highlight }
      onMouseLeave={ clearHighlight }
      type="button"
    >
      { getName(bo) }
    </button>
  );
}
