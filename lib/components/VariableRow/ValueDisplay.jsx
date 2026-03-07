import CodeMirrorEditor from '../CodeMirrorEditor';

function entriesToObject(entries, isList) {
  if (isList) {
    return entries.map(e => entryToValue(e));
  }
  const obj = {};
  for (const e of entries) {
    obj[e.name] = entryToValue(e);
  }
  return obj;
}

function entryToValue(entry) {
  if (entry.entries && entry.entries.length > 0) {
    return entriesToObject(entry.entries, entry.isList);
  }
  if (entry.type === 'Null' || entry.info === null) return null;
  if (!entry.info) return undefined;
  const trimmed = entry.info.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== '') return num;
  return entry.info;
}

function buildDoc(info, type, entries, isList) {
  if (entries && entries.length > 0) {
    return JSON.stringify(entriesToObject(entries, isList), null, 2);
  }
  if (type === 'Null' || info === null) return 'null';
  return info != null ? String(info) : '';
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
        isJson={ hasEntries }
      />
    </div>
  );
}
