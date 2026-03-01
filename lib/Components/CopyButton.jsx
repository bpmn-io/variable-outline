/* global clearTimeout, setTimeout, navigator */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Checkmark } from '@carbon/icons-react';


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
      className={ `variable-copy-button${ copied ? ' variable-copy-button--copied' : '' }` }
      title={ copied ? 'Copied!' : 'Copy to insert' }
      aria-label={ copied ? 'Copied!' : 'Copy to insert' }
      onClick={ handleCopy }
    >
      { copied
        ? <Checkmark className="variable-copy-icon" />
        : <Copy className="variable-copy-icon" />
      }
    </button>
  );
}
