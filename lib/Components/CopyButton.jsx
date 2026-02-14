/* global clearTimeout, setTimeout, navigator */

// eslint-disable-next-line no-unused-vars
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Checkmark } from '@carbon/icons-react';
import { preventEnterOrSpace } from '../utils/preventEnterOrSpace';

export default function CopyButton({ text }) {
  const [ copied, setCopied ] = useState(false);
  const copyTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    };
  }, []);

  const handleCopy = useCallback((e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [ text ]);

  return (
    <button
      className={ `variable-copy-button${copied ? ' variable-copy-button--copied' : ''}` }
      title={ copied ? 'Copied!' : 'Copy to insert' }
      onClick={ handleCopy }
      onKeyDown={ preventEnterOrSpace(handleCopy) }
    >
      { copied
        ? <Checkmark className="variable-copy-icon" />
        : <Copy className="variable-copy-icon" />
      }
      { copied && <span className="variable-copy-tooltip">Copied!</span> }
    </button>
  );
}
