import { useState } from 'react';
import { ChevronRight } from '@carbon/icons-react';

export default function CollapsibleDetailSection({
  label,
  defaultExpanded = false,
  children
}) {

  const [ expanded, setExpanded ] = useState(defaultExpanded);

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <div className={ `variable-detail-section${!expanded ? ' variable-detail-section--collapsed' : ''}` }>
      <button
        type="button"
        className="variable-detail-label variable-detail-label--collapsible"
        onClick={ toggleExpanded }
      >
        <ChevronRight className={ `variable-detail-chevron${!expanded ? '' : ' variable-detail-chevron--expanded'}` } />
        { label }
      </button>
      { expanded && (
        <div className="variable-detail-content">
          { children }
        </div>
      ) }
    </div>
  );
}
