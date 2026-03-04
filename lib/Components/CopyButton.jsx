import { Copy, Checkmark } from '@carbon/icons-react';
import useClipboardCopy from '../hooks/useClipboardCopy';

export default function CopyButton({ text }) {
  const { copied, copy } = useClipboardCopy(text);

  return (
    <button
      className={ `variable-copy-button${ copied ? ' variable-copy-button--copied' : '' }` }
      type="button"
      title="Copy variable name"
      aria-label="Copy variable name"
      onClick={ copy }
    >
      <span aria-live="polite" style={ { display: 'none' } }>
        { copied ? 'Copied to clipboard!' : '' }
      </span>

      { copied
        ? <Checkmark className="variable-copy-icon" />
        : <Copy className="variable-copy-icon" />
      }
    </button>
  );
}
