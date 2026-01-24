// eslint-disable-next-line no-unused-vars
import React, { useState, useCallback, useRef } from 'react';
import { ChevronRight, Copy, Checkmark, View, Edit } from '@carbon/icons-react';

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import useService from '../../hooks/useService';

import './VariableTable.scss';


function VariableRow({ row, highlight, expanded, onToggle }) {
  const [ copied, setCopied ] = useState(false);
  const copyTimeout = useRef(null);

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(row.name);
    setCopied(true);
    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopied(false), 1500);
  }, [ row.name ]);

  const writeCount = row.origin?.filter(o => o.id !== row.scope?.id).length || 0;

  return (
    <div className={ `variable-row${highlight ? ' variable-row--highlight' : ''}` }>
      <div
        className="variable-row-header"
        onClick={ onToggle }
        role="button"
        tabIndex={ 0 }
        aria-expanded={ expanded }
        onKeyDown={ (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } } }
      >
        <ChevronRight className={ `variable-row-chevron${expanded ? ' variable-row-chevron--expanded' : ''}` } />
        <div className="variable-row-content">
          <div className="variable-row-info">
            <span className="variable-name">{ row.name }</span>
            { row.type && <span className="variable-type-tag">{ row.type }</span> }
            { writeCount > 0 && <span className="variable-access-tag variable-access-tag--write" title={ `written ${writeCount} time${writeCount > 1 ? 's' : ''}` }><Edit className="variable-access-icon" />{ writeCount > 1 && <span className="variable-access-count">{ writeCount }</span> }</span> }
          </div>
        </div>
        <button
          className={ `variable-copy-button${copied ? ' variable-copy-button--copied' : ''}` }
          title={ copied ? 'Copied!' : 'Copy to insert' }
          onClick={ handleCopy }
        >
          { copied
            ? <Checkmark className="variable-copy-icon" />
            : <Copy className="variable-copy-icon" />
          }
          { copied && <span className="variable-copy-tooltip">Copied!</span> }
        </button>
      </div>
      { expanded && (
        <div className="variable-row-details">
          <div className="variable-detail-section">
            <div className="variable-detail-label">
              <Edit className="variable-detail-label-icon" />
              WRITTEN BY
            </div>
            { row.origin?.length > 0 ? (
              row.origin.map(o => (
                <ElementEntry key={ o.id } element={ o } />
              ))
            ) : (
              <span className="variable-detail-empty">—</span>
            ) }
          </div>
          <div className="variable-detail-section">
            <div className="variable-detail-label">
              <View className="variable-detail-label-icon" />
              READ BY
            </div>
            <span className="variable-detail-empty">Requires FEEL expression analysis</span>
          </div>
        </div>
      ) }
    </div>
  );
}


function ElementEntry({ element: bo }) {
  const selection = useService('selection');
  const canvas = useService('canvas');
  const elementRegistry = useService('elementRegistry');

  const selectedElements = selection.get();
  const isSelected = selectedElements.some(el => el.id === bo.id);

  const handleClick = () => {
    const element = elementRegistry.get(bo.id);

    if (!element || is(element, 'bpmn:Process')) {
      return;
    }

    canvas.scrollToElement(element);
    selection.select(element);
  };

  return (
    <button
      className={ `variable-element-entry${isSelected ? ' variable-element-entry--selected' : ''}` }
      onClick={ handleClick }
    >
      { bo.name || bo.label || bo.id }
    </button>
  );
}


function Variables({ variables }) {

  const rows = variables.map(variable => {
    return {
      ...variable,
      id: variable.name + variable.scope.id,
      type: variable.detail && variable.detail.split('|').filter(e => e).join(', '),
    };
  });

  const selection = useService('selection');
  const selectedElements = selection.get();

  // Check if the process itself is selected (no need for local section)
  const isProcessSelected = !selectedElements.length || selectedElements.some(el => {
    const bo = getBusinessObject(el);
    return is(bo, 'bpmn:Process') || bo?.processRef;
  });

  // Split into local (scoped to selected element) and global
  const localRows = rows.filter(row => {
    return selectedElements.some(el => el.id === row.scope.id);
  });

  const globalRows = rows.filter(row => {
    return !selectedElements.some(el => el.id === row.scope.id);
  });

  // Sort: variables used by selected element first, then alphabetical
  const sortRows = (a, b) => {
    const aUsedBySelected = selectedElements.some(el =>
      a.origin?.some(o => o.id === el.id)
    );
    const bUsedBySelected = selectedElements.some(el =>
      b.origin?.some(o => o.id === el.id)
    );

    if (aUsedBySelected && !bUsedBySelected) return -1;
    if (!aUsedBySelected && bUsedBySelected) return 1;
    return a.name.localeCompare(b.name);
  };

  const sortedGlobalRows = [ ...globalRows ].sort(sortRows);
  const sortedLocalRows = [ ...localRows ].sort(sortRows);

  const [ expandedId, setExpandedId ] = useState(null);

  const handleToggle = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="variable-list-container">
      <div className="variable-list-inner">

        { /* Local variables section (hidden when process is selected) */ }
        { !isProcessSelected && <>
          <div className="variable-section-header">
            <span>Local variables</span>
            <span className="variable-section-count">{ localRows.length }</span>
          </div>
          { sortedLocalRows.length > 0 ? (
            sortedLocalRows.map(row => (
              <VariableRow key={ row.id } row={ row } highlight={ false } expanded={ expandedId === row.id } onToggle={ () => handleToggle(row.id) } />
            ))
          ) : (
            <p className="no-variables-found">No local variables found.</p>
          ) }
        </> }

        { /* Global variables section */ }
        <div className="variable-section-header">
          <span>Global variables</span>
          <span className="variable-section-count">{ globalRows.length }</span>
        </div>
        { sortedGlobalRows.length > 0 ? (
          sortedGlobalRows.map(row => {
            const highlight = selectedElements.some(el =>
              row.origin?.some(o => o.id === el.id)
            );
            return <VariableRow key={ row.id } row={ row } highlight={ highlight } expanded={ expandedId === row.id } onToggle={ () => handleToggle(row.id) } />;
          })
        ) : (
          <p className="no-variables-found">No global variables found.</p>
        ) }

      </div>
    </div>
  );
}

export default Variables;