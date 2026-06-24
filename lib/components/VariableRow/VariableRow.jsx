import { ChevronRight, Code, Edit, View } from '@carbon/icons-react';
import { Tooltip } from '@carbon/react';

import CopyButton from '../CopyButton';
import ValueDisplay from './ValueDisplay';
import ElementEntry from './ElementEntry';
import CollapsibleDetailSection from './CollapsibleDetailSection';
import useElementHighlight from '../../hooks/useElementHighlight';
import { getName } from '../../utils/elementUtil';


function VariantSection({ variant, variableName }) {
  const hasValue = variant.type || variant.info || variant.entries?.length > 0;

  return (
    <div className="variable-detail-section variable-detail-section--variant">
      { variant.origin.length === 1 ? (
        <div className="variable-detail-section variable-detail-section--inline">
          <Edit className="variable-detail-label-icon" />
          <span className="variable-detail-label-text">Written by</span>
          <ElementEntry element={ variant.origin[0] } inline />
        </div>
      ) : (
        <CollapsibleDetailSection label={ `Written by ${variant.origin.length} elements` }>
          { variant.origin.map(o => (
            <ElementEntry key={ o.id } element={ o } />
          )) }
        </CollapsibleDetailSection>
      ) }
      { hasValue && (
        <div className="variable-detail-section">
          <div className="variable-detail-label">
            <Code className="variable-detail-label-icon" />
            <span>Value</span>
          </div>
          <ValueDisplay
            info={ variant.info }
            type={ variant.type }
            entries={ variant.entries }
            isList={ variant.isList }
            variableName={ variableName }
          />
        </div>
      ) }
    </div>
  );
}


export default function VariableRow({ variable, isSelectedOrigin, expanded, onToggle }) {
  const writers = variable.origin;
  const writeCount = writers.length;
  const variants = variable.variants;
  const hasVariants = variants?.length > 1;

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
    <div className={ `variable-row${expanded ? ' variable-row--expanded' : ''}` }>
      <div className="variable-row-header">
        <button
          className="variable-row-toggle"
          type="button"
          onClick={ onToggle }
          aria-expanded={ expanded }
        >
          <ChevronRight className={ `variable-row-chevron${expanded ? ' variable-row-chevron--expanded' : ''}` } />
          <div className="variable-row-content">
            <div className="variable-row-info">
              <span className="variable-name">{ variable.name }</span>

              { isSelectedOrigin && (
                <Tooltip label="This variable is written by current selection." align="bottom" autoAlign>
                  <span className="variable-written-tag">
                    <Edit />
                  </span>
                </Tooltip>
              ) }
            </div>
          </div>
        </button>

        <CopyButton text={ variable.name } />
      </div>
      { expanded && (
        <div className="variable-row-details">
          { hasVariants ? (
            variants.map((variant, index) => (
              <VariantSection
                key={ index }
                variant={ variant }
                variableName={ variable.name }
              />
            ))
          ) : (
            <>
              { writeCount === 1 ? (
                <div className="variable-detail-section variable-detail-section--inline">
                  <Edit className="variable-detail-label-icon" />
                  <span className="variable-detail-label-text">Written by</span>
                  <ElementEntry element={ writers[0] } inline />
                </div>
              ) : (
                <CollapsibleDetailSection
                  label={ writtenByTitle }
                  onMouseEnter={ highlightWriters }
                  onMouseLeave={ clearWriters }
                >
                  { writers.map(o => (
                    <ElementEntry key={ o.id } element={ o } />
                  )) }
                </CollapsibleDetailSection>
              ) }
              { (variable.type || variable.info || variable.entries?.length > 0) && (
                <div className="variable-detail-section">
                  <div className="variable-detail-label">
                    <Code className="variable-detail-label-icon" />
                    <Tooltip className="bio-vo-tooltip-wrapper" label="This is a merged representation." align="bottom" autoAlign>
                      <span>Value</span>
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
            </>
          ) }
          { readCount > 0 && (readCount === 1 ? (
            <div className="variable-detail-section variable-detail-section--inline">
              <View className="variable-detail-label-icon" />
              <span className="variable-detail-label-text">Used by</span>
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
        </div>
      ) }
    </div>
  );
}
