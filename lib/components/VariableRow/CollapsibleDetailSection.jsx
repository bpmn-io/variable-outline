import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@camunda/design-system';
import { ChevronRight } from '@camunda/design-system/icons';

export default function CollapsibleDetailSection({
  label,
  defaultExpanded = false,
  onMouseEnter,
  onMouseLeave,
  children
}) {

  const [ expanded, setExpanded ] = useState(defaultExpanded);

  return (
    <Collapsible
      open={ expanded }
      onOpenChange={ setExpanded }
      className={ `variable-detail-section${!expanded ? ' variable-detail-section--collapsed' : ''}` }
    >
      <CollapsibleTrigger
        className="variable-detail-label variable-detail-label--collapsible"
        onMouseEnter={ onMouseEnter }
        onMouseLeave={ onMouseLeave }
      >
        <ChevronRight className={ `variable-detail-chevron${!expanded ? '' : ' variable-detail-chevron--expanded'}` } />
        { label }
      </CollapsibleTrigger>
      <CollapsibleContent className="variable-detail-content">
        { children }
      </CollapsibleContent>
    </Collapsible>
  );
}
