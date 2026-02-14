/**
 * Prevent default behavior on Enter or Space and run callback instead.
 * Useful for making non-button elements keyboard-accessible without
 * unintended side effects (scrolling, toggling, etc.).
 *
 * @param {Function} callback - Function to call when Enter or Space is pressed
 * @returns {Function} onKeyDown handler function
 */
export function preventEnterOrSpace(callback) {
  return (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };
}
