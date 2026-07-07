import { useState } from 'react';
import { ChevronRight } from '@carbon/icons-react';
import { Tooltip } from '@carbon/react';

import CopyButton from '../CopyButton';
import ValueDisplay from './ValueDisplay';
import ElementEntry from './ElementEntry';
import UsedBySection from './UsedBySection';
import useElementHighlight from '../../hooks/useElementHighlight';
import useFilter from '../../hooks/useFilter';
import buildValuePreview from '../../utils/valuePreview';
import { getName } from '../../utils/elementUtil';


function getVariants(variable) {
  const variants = (variable.variants || []).filter(variant => variant.origin?.length);

  if (variants.length) {
    return variants;
  }

  const { origin = [], type, info, entries, isList } = variable;

  // without a writer there is no "writes" row (e.g. external references)
  if (!origin.length) {
    return [];
  }

  return [ { origin, type, info, entries, isList } ];
}


function VariantRow({ variant, variableName }) {
  const [ open, setOpen ] = useState(false);

  const writers = variant.origin || [];
  const { highlight, clearHighlight } = useElementHighlight(writers);

  const hasValue = variant.type || variant.info || variant.entries?.length > 0;
  const preview = buildValuePreview(variant);

  const toggle = () => setOpen(open => !open);

  const handleLineClick = event => {

    // element links and the toggle handle their own clicks
    if (event.target.closest('button')) {
      return;
    }

    toggle();
  };

  return (
    <div className="variable-variant">
      <div className="variable-variant-line" onClick={ handleLineClick }>
        <ChevronRight
          aria-hidden="true"
          className={ `variable-variant-chevron${open ? ' variable-variant-chevron--expanded' : ''}` }
        />
        { writers.length === 1 ? (
          <ElementEntry element={ writers[0] } inline />
        ) : (
          <span
            className="variable-variant-writers"
            title={ writers.map(getName).join(', ') }
            onMouseEnter={ highlight }
            onMouseLeave={ clearHighlight }
          >
            { `${writers.length} elements` }
          </span>
        ) }
        <button
          className="variable-variant-toggle"
          type="button"
          onClick={ toggle }
          aria-expanded={ open }
        >
          <span className="variable-variant-writes">writes</span>
          { !open && <span className="variable-variant-preview" title={ preview }>{ preview }</span> }
        </button>
      </div>
      { open && (
        <div className="variable-variant-value">
          { writers.length > 1 && writers.map(writer => (
            <ElementEntry key={ writer.id } element={ writer } />
          )) }
          { hasValue ? (
            <ValueDisplay
              info={ variant.info }
              type={ variant.type }
              entries={ variant.entries }
              isList={ variant.isList }
              variableName={ variableName }
            />
          ) : '-' }
        </div>
      ) }
    </div>
  );
}


export default function VariableRow({ variable, isSelectedOrigin, isSelectedReader, selectionName, expanded, onToggle }) {
  const variants = getVariants(variable);

  const readers = (variable.usedBy || []).filter(el => el && el.id);
  const readCount = readers.length;

  // while filtering by selection, every visible row is related to it
  const { writtenOnly } = useFilter();
  const showTags = !writtenOnly;

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
              <span className="variable-name" title={ variable.name }>{ variable.name }</span>

              { showTags && isSelectedOrigin && (
                <Tooltip label={ selectionName ? `Written by ${selectionName}` : 'Written by current selection' } align="bottom" autoAlign>
                  <span className="variable-rw-tag variable-rw-tag--written">written</span>
                </Tooltip>
              ) }

              { showTags && isSelectedReader && (
                <Tooltip label={ selectionName ? `Read by ${selectionName}` : 'Read by current selection' } align="bottom" autoAlign>
                  <span className="variable-rw-tag variable-rw-tag--read">read</span>
                </Tooltip>
              ) }
            </div>
          </div>
        </button>

        <CopyButton text={ variable.name } />
      </div>
      { expanded && (
        <div className="variable-row-details">
          { variants.map((variant, index) => (
            <VariantRow
              key={ index }
              variant={ variant }
              variableName={ variable.name }
            />
          )) }
          { readCount > 0 && <UsedBySection readers={ readers } /> }
        </div>
      ) }
    </div>
  );
}
