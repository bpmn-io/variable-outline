import { ChevronRight, Code } from '@carbon/icons-react';

import CopyButton from '../CopyButton';
import ElementEntry from './ElementEntry';
import ValueDisplay from './ValueDisplay';
import CollapsibleDetailSection from './CollapsibleDetailSection';
import { preventEnterOrSpace } from '../../utils/preventEnterOrSpace';

export default function VariableRow({ variable, isSelectedOrigin, expanded, onToggle }) {
  const writers = variable.origin;
  const writeCount = writers.length;

  const singleWriterName = writeCount === 1
    ? (writers[0].name || writers[0].id)
    : null;
  const writtenByTitle = singleWriterName
    ? `Written by ${singleWriterName}`
    : `Written by ${writeCount} elements`;

  const writtenByLabel = writtenByTitle.toLocaleUpperCase();

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
            <span className="variable-name">{ variable.name }</span>

            {!expanded && (
              <span
                className="variable-access-tag variable-access-tag--write"
                title={ writtenByTitle }
              >
                <span className="variable-access-count">{ writtenByLabel }</span>
              </span>
            )}
          </div>
        </div>
        <CopyButton text={ variable.name } />
      </div>
      { expanded && (
        <div className="variable-row-details">
          <CollapsibleDetailSection label={ writtenByLabel }>
            { writers.map(o => (
              <ElementEntry key={ o.id } element={ o } />
            )) }
          </CollapsibleDetailSection>
          <CollapsibleDetailSection label="READ BY">
            <span className="variable-detail-empty">Requires FEEL expression analysis</span>
          </CollapsibleDetailSection>
          { (variable.type || variable.info || variable.entries?.length > 0) && (
            <div className="variable-detail-section">
              <div className="variable-detail-label">
                <Code className="variable-detail-label-icon" />
                VALUE
              </div>
              <ValueDisplay
                info={ variable.info }
                type={ variable.type }
                entries={ variable.entries }
                isList={ variable.isList }
                variableName={ variable.name }
              />
            </div>
          ) }
        </div>
      ) }
    </div>
  );
}
