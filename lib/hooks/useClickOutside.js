/* global document */
import { useEffect, useRef } from 'react';

/**
 * Hook that triggers a callback when user clicks outside the returned ref element.
 *
 * @param {Function} callback - Function to call when click outside is detected
 * @param {boolean} enabled - Whether the listener should be active (default: true)
 * @returns {React.RefObject} - Ref to attach to the element to monitor
 */
export default function useClickOutside(callback, enabled = true) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    if (enabled) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ callback, enabled ]);

  return ref;
}
