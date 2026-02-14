/* global navigator, setTimeout, clearTimeout */

// eslint-disable-next-line no-unused-vars
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronRight, Copy, Checkmark } from '@carbon/icons-react';
import { preventEnterOrSpace } from '../../utils/preventEnterOrSpace';

const MAX_VALUE_LENGTH = 40;

function inferValueType(info) {
  if (!info) return 'unknown';
  const trimmed = info.trim();
  if (trimmed === 'true' || trimmed === 'false') return 'boolean';
  if (trimmed === 'null') return 'null';
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return 'number';
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith('\'') && trimmed.endsWith('\''))
  ) return 'string';
  return 'string';
}

const PREVIEW_KEYS = 2;

function formatPreview(entries, isList) {
  if (!entries || entries.length === 0) return isList ? '[]' : '{}';

  const keys = entries.slice(0, PREVIEW_KEYS).map(e => e.name).join(', ');
  const more = entries.length > PREVIEW_KEYS ? ', \u2026' : '';
  const count = entries.length;

  return isList
    ? `[ ${keys}${more} ] (${count})`
    : `{ ${keys}${more} } (${count})`;
}

function truncate(value) {
  if (!value || value.length <= MAX_VALUE_LENGTH) return value;
  return value.slice(0, MAX_VALUE_LENGTH) + '\u2026';
}

const AUTO_EXPAND_THRESHOLD = 3;

const SIMPLE_KEY = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

function buildFeelPath(parentPath, name, index, parentIsList) {
  if (!parentPath) return name;

  if (parentIsList) {
    return `${parentPath}[${index + 1}]`;
  }

  if (SIMPLE_KEY.test(name)) {
    return `${parentPath}.${name}`;
  }

  return `${parentPath}["${name}"]`;
}


function CopyPathButton({ feelPath }) {
  const [ copied, setCopied ] = useState(false);
  const timeout = useRef(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const handleCopy = useCallback((e) => {

    // prevent click from toggling the parent tree node
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(feelPath).then(() => {
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [ feelPath ]);

  return (
    <button
      className={ `vd-copy-button${copied ? ' vd-copy-button--copied' : ''}` }
      title={ copied ? 'Copied!' : `Copy ${feelPath}` }
      onClick={ handleCopy }
      onKeyDown={ preventEnterOrSpace(handleCopy) }
    >
      { copied
        ? <Checkmark className="vd-copy-icon" />
        : <Copy className="vd-copy-icon" />
      }
      { copied && <span className="vd-copy-tooltip">Copied!</span> }
    </button>
  );
}


function ValueNode({ entry, depth, defaultExpanded = false, feelPath, parentIsList, index }) {
  const [ expanded, setExpanded ] = useState(defaultExpanded);
  const hasChildren = entry.entries && entry.entries.length > 0;
  const valueType = inferValueType(entry.info);

  const nodePath = depth === 0
    ? feelPath
    : buildFeelPath(feelPath, entry.name, index, parentIsList);

  const toggle = useCallback(() => setExpanded(prev => !prev), []);

  const handleToggleKeyboard = preventEnterOrSpace(() => {
    if (hasChildren) {
      toggle();
    }
  });

  const handleKeyDown = useCallback((e) => {

    // Handle Enter/Space with utility, but add stopPropagation
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      handleToggleKeyboard(e);
    }

    // Handle Ctrl+C separately
    if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {

      // prevent diagram canvas element copy
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(nodePath).catch(() => {});
    }
  }, [ hasChildren, toggle, nodePath, handleToggleKeyboard ]);

  return (
    <li
      className="vd-node"
      role="treeitem"
      aria-expanded={ hasChildren ? expanded : undefined }
      aria-level={ depth + 1 }
      style={ { '--vd-depth': depth } }
    >
      <div
        className={ `vd-row${hasChildren ? ' vd-row--branch' : ''}` }
        onClick={ hasChildren ? toggle : undefined }
        onKeyDown={ handleKeyDown }
        tabIndex={ 0 }
      >
        <span className="vd-indicator">
          { hasChildren
            ? <ChevronRight className={ `vd-chevron${expanded ? ' vd-chevron--open' : ''}` } />
            : <span className="vd-bullet">&bull;</span>
          }
        </span>

        <span className="vd-key" title={ hasChildren && entry.info ? entry.info : undefined }>{ entry.name }</span>

        { entry.info && !hasChildren && (
          <span
            className={ `vd-value vd-value--${valueType}` }
            title={ entry.info.length > MAX_VALUE_LENGTH ? entry.info : undefined }
          >
            { truncate(entry.info) }
          </span>
        ) }

        { hasChildren && !expanded && (
          <span className="vd-preview">{ formatPreview(entry.entries, entry.isList) }</span>
        ) }

        <CopyPathButton feelPath={ nodePath } />
      </div>

      { expanded && hasChildren && (
        <ul className="vd-children" role="group">
          { entry.entries.map((child, i) => (
            <ValueNode
              key={ child.name || i }
              entry={ child }
              depth={ depth + 1 }
              feelPath={ nodePath }
              parentIsList={ entry.isList }
              index={ i }
            />
          )) }
        </ul>
      ) }
    </li>
  );
}

function PrimitiveValue({ info }) {
  const valueType = inferValueType(info);
  return (
    <span
      className={ `vd-primitive vd-value--${valueType}` }
      title={ info.length > MAX_VALUE_LENGTH ? info : undefined }
    >
      { truncate(info) }
    </span>
  );
}

export default function ValueDisplay({ info, entries, isList, variableName }) {
  const hasInfo = !!info;
  const hasEntries = entries?.length > 0;

  if (!hasInfo && !hasEntries) {
    return null;
  }

  if (hasInfo && !hasEntries) {
    return (
      <div className="vd-root">
        <PrimitiveValue info={ info } />
      </div>
    );
  }

  const rootEntry = {
    name: isList ? '[]' : '{}',
    info: hasInfo ? info : undefined,
    entries,
    isList
  };

  return (
    <div className="vd-root">
      <ul className="vd-tree" role="tree">
        <ValueNode
          entry={ rootEntry }
          depth={ 0 }
          defaultExpanded={ entries.length <= AUTO_EXPAND_THRESHOLD }
          feelPath={ variableName || '' }
          parentIsList={ false }
          index={ 0 }
        />
      </ul>
    </div>
  );
}

