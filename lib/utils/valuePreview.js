const PREVIEW_KEYS = 2;
const MAX_LENGTH = 40;

function truncate(value) {
  if (value.length <= MAX_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_LENGTH)}…`;
}

/**
 * Build a one-line textual preview of a variable value, following the
 * fold-preview grammar of the value display.
 *
 * @param { { info?: string, type?: string, entries?: Array, isList?: boolean } } value
 *
 * @return { string }
 */
export default function buildValuePreview({ info, type, entries, isList } = {}) {
  if (entries?.length > 0) {
    if (isList) {
      return `[ ${entries.length} item${entries.length === 1 ? '' : 's'} ]`;
    }

    const keys = entries.slice(0, PREVIEW_KEYS).map(entry => entry.name);
    const parts = entries.length > PREVIEW_KEYS ? [ ...keys, '…' ] : keys;

    return `{ ${parts.join(', ')} }`;
  }

  if (type === 'Null' || info === null) {
    return 'null';
  }

  if (info != null && String(info).trim() !== '') {
    return truncate(String(info).trim());
  }

  return '';
}
