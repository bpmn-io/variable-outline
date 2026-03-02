/* global clearTimeout, setTimeout, navigator */
import { useState, useCallback, useRef, useEffect } from 'react';

export default function useClipboardCopy(text) {
  const [ copied, setCopied ] = useState(false);
  const copyTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    };
  }, []);

  const copy = useCallback((e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [ text ]);

  return { copied, copy };
}
