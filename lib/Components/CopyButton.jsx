import { Copy, Checkmark } from '@carbon/icons-react';
import useClipboardCopy from '../hooks/useClipboardCopy';

export default function CopyButton({ text }) {
  const { copied, copy } = useClipboardCopy(text);

  return (
    <button
      className={ `variable-copy-button${ copied ? ' variable-copy-button--copied' : '' }` }
      title={ copied ? 'Copied!' : 'Copy to insert' }
      aria-label={ copied ? 'Copied!' : 'Copy to insert' }
      onClick={ copy }
    >
      { copied
        ? <Checkmark className="variable-copy-icon" />
        : <Copy className="variable-copy-icon" />
      }
    </button>
  );
}
