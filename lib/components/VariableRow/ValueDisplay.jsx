import CodeMirrorEditor from '../CodeMirrorEditor';

function formatValue(entry, depth) {
  if (entry.entries?.length > 0) {
    return buildFeelDoc(entry.entries, entry.isList, depth + 1);
  }

  if (entry.type === 'Null' || entry.info == null || entry.info === '') {
    return 'null';
  }

  const value = String(entry.info).trim();
  return value.startsWith('=') ? value.slice(1) : value;
}

function buildFeelDoc(entries, isList, depth = 1) {
  const pad = '  '.repeat(depth);
  const closePad = '  '.repeat(depth - 1);

  if (isList) {
    const items = entries.map(e => `${pad}${formatValue(e, depth)}`);
    return `[\n${items.join(',\n')}\n${closePad}]`;
  }

  const items = entries.map(e => {
    const value = formatValue(e, depth);
    return `${pad}"${e.name}": ${value}`;
  });
  return `{\n${items.join(',\n')}\n${closePad}}`;
}

function buildDoc(info, type, entries, isList) {
  if (entries && entries.length > 0) {
    return buildFeelDoc(entries, isList);
  }
  if (type === 'Null' || info === null) return 'null';
  if (info != null) return String(info).trim();
  return '';
}

export default function ValueDisplay({ info, type, entries, isList, variableName }) {
  const hasEntries = entries?.length > 0;
  const infoPresent = type === 'Null' || info === null || (info !== null && info !== undefined && info !== '');

  if (!infoPresent && !hasEntries) return '-';

  const doc = buildDoc(info, type, entries, isList);

  return (
    <div className="vd-root">
      <CodeMirrorEditor
        doc={ doc }
        variableName={ variableName }
        isFeel={ hasEntries || (info != null && String(info).trim().startsWith('=')) }
        isStructured={ hasEntries }
      />
    </div>
  );
}
