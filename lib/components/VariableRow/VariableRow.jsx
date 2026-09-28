import { Collapsible, CollapsibleContent, CollapsibleTrigger, Text } from '@camunda/design-system';
import { ChevronRight, Code, Eye, PencilLine } from '@camunda/design-system/icons';

import Tooltip from '../Tooltip';
import CopyButton from '../CopyButton';
import ValueDisplay from './ValueDisplay';
import ElementEntry from './ElementEntry';
import CollapsibleDetailSection from './CollapsibleDetailSection';
import useElementHighlight from '../../hooks/useElementHighlight';
import { getName } from '../../utils/elementUtil';


export default function VariableRow({ variable, isSelectedOrigin, expanded, onToggle }) {
  const writers = variable.origin;
  const writeCount = writers.length;

  const readers = (variable.usedBy || []).filter(el => el && el.id);
  const readCount = readers.length;

  const { highlight: highlightWriters, clearHighlight: clearWriters } = useElementHighlight(writers);
  const { highlight: highlightReaders, clearHighlight: clearReaders } = useElementHighlight(readers);

  const singleWriterName = writeCount === 1
    ? getName(writers[0])
    : null;
  const writtenByTitle = singleWriterName
    ? `Written by ${singleWriterName}`
    : `Written by ${writeCount} elements`;
  return (
    <Collapsible
      open={ expanded }
      onOpenChange={ onToggle }
      className={ `variable-row${expanded ? ' variable-row--expanded' : ''}` }
    >
      <div className="variable-row-header">
        <CollapsibleTrigger className="variable-row-toggle">
          <ChevronRight className={ `variable-row-chevron${expanded ? ' variable-row-chevron--expanded' : ''}` } />
          <div className="variable-row-content">
            <div className="variable-row-info">
              <span className="variable-name">{ variable.name }</span>

              { isSelectedOrigin && (
                <Tooltip label="This variable is written by current selection.">
                  <span className="variable-written-tag">
                    <PencilLine aria-hidden="true" />
                  </span>
                </Tooltip>
              ) }
            </div>
          </div>
        </CollapsibleTrigger>

        <CopyButton text={ variable.name } />
      </div>
      <CollapsibleContent className="variable-row-details">
        { writeCount === 1 ? (
          <div className="variable-detail-section variable-detail-section--inline">
            <PencilLine className="variable-detail-label-icon" />
            <Text variant="helper" className="variable-detail-label-text">Written by</Text>
            <ElementEntry element={ writers[0] } variableName={ variable.name } inline />
          </div>
        ) : (
          <CollapsibleDetailSection
            label={ writtenByTitle }
            onMouseEnter={ highlightWriters }
            onMouseLeave={ clearWriters }
          >
            { writers.map(o => (
              <ElementEntry key={ o.id } element={ o } variableName={ variable.name } />
            )) }
          </CollapsibleDetailSection>
        ) }
        { readCount > 0 && (readCount === 1 ? (
          <div className="variable-detail-section variable-detail-section--inline">
            <Eye className="variable-detail-label-icon" />
            <Text variant="helper" className="variable-detail-label-text">Used by</Text>
            <ElementEntry element={ readers[0] } inline />
          </div>
        ) : (
          <CollapsibleDetailSection
            label={ `Used by ${readCount} elements` }
            onMouseEnter={ highlightReaders }
            onMouseLeave={ clearReaders }
          >
            { readers.map(r => (
              <ElementEntry key={ r.id } element={ r } />
            )) }
          </CollapsibleDetailSection>
        )) }
        { (variable.type || variable.info || variable.entries?.length > 0) && (
          <div className="variable-detail-section">
            <div className="variable-detail-label">
              <Code className="variable-detail-label-icon" />
              <Tooltip label="This is a merged representation.">
                <Text variant="helper" className="bio-vo-has-tooltip">Value</Text>
              </Tooltip>
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
      </CollapsibleContent>
    </Collapsible>
  );
}
