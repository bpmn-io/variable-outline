// eslint-disable-next-line no-unused-vars
import React from 'react';
import { ChevronRight, Edit, Code } from '@carbon/icons-react';

import CopyButton from '../CopyButton';
import ElementEntry from './ElementEntry';
import ValueDisplay from './ValueDisplay';
import CollapsibleDetailSection from './CollapsibleDetailSection';
import { preventEnterOrSpace } from '../../utils/preventEnterOrSpace';

export default function VariableRow({ row, isSelectedOrigin, expanded, onToggle }) {
  const writeCount = row.origin?.filter(o => o.id !== row.scope?.id).length || 0;

  return (
    <div className={ `variable-row${isSelectedOrigin ? ' variable-row--highlight' : ''}${expanded ? ' variable-row--expanded' : ''}` }>
      <div
        className="variable-row-header"
        onClick={ onToggle }
        role="button"
        tabIndex={ 0 }
        aria-expanded={ expanded }
        onKeyDown={ preventEnterOrSpace(onToggle) }
      >
        <ChevronRight className={ `variable-row-chevron${expanded ? ' variable-row-chevron--expanded' : ''}` } />
        <div className="variable-row-content">
          <div className="variable-row-info">
            <span className="variable-name">{ row.name }</span>
            { row.type && <span className="variable-type-tag">{ row.type }</span> }
            { !expanded && writeCount > 0 && <span className="variable-access-tag variable-access-tag--write" title={ `written ${writeCount} time${writeCount > 1 ? 's' : ''}` }><Edit className="variable-access-icon" />{ writeCount > 1 && <span className="variable-access-count">{ writeCount }</span> }</span> }
          </div>
        </div>
        <CopyButton text={ row.name } />
      </div>
      { expanded && (
        <div className="variable-row-details">
          <CollapsibleDetailSection
            label="WRITTEN BY"
            badge={ writeCount > 0 && <span className="variable-access-tag variable-access-tag--write" title={ `written ${writeCount} time${writeCount > 1 ? 's' : ''}` }><Edit className="variable-access-icon" />{ writeCount > 1 && <span className="variable-access-count">{ writeCount }</span> }</span> }
          >
            { row.origin?.length > 0 ? (
              row.origin.map(o => (
                <ElementEntry key={ o.id } element={ o } />
              ))
            ) : (
              <span className="variable-detail-empty">—</span>
            ) }
          </CollapsibleDetailSection>
          <CollapsibleDetailSection
            label="READ BY"
          >
            <span className="variable-detail-empty">Requires FEEL expression analysis</span>
          </CollapsibleDetailSection>
          { (row.info || row.entries?.length > 0) && (
            <div className="variable-detail-section">
              <div className="variable-detail-label">
                <Code className="variable-detail-label-icon" />
                VALUE
              </div>
              <ValueDisplay info={ row.info } entries={ row.entries } isList={ row.isList } variableName={ row.name } />
            </div>
          ) }
        </div>
      ) }
    </div>
  );
}
