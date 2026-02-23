import { useState } from 'react';
import { ChevronRight } from '@carbon/icons-react';
import { preventEnterOrSpace } from '../../utils/preventEnterOrSpace';

export default function CollapsibleDetailSection({
  label,
  defaultExpanded = false,
  children
}) {

  const [ expanded, setExpanded ] = useState(defaultExpanded);

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <div className={ `variable-detail-section${!expanded ? ' variable-detail-section--collapsed' : ''}` }>
      <div
        className="variable-detail-label variable-detail-label--collapsible"
        onClick={ toggleExpanded }
        role="button"
        tabIndex={ 0 }
        onKeyDown={ preventEnterOrSpace(toggleExpanded) }
      >
        <ChevronRight className={ `variable-detail-chevron${!expanded ? '' : ' variable-detail-chevron--expanded'}` } />
        { label }
      </div>
      { expanded && (
        <div className="variable-detail-content">
          { children }
        </div>
      ) }
    </div>
  );
}
