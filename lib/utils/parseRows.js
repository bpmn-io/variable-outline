export default function parseRows(variables) {
  return variables.map(variable => ({
    ...variable,
    id: `${variable.scope?.id}:${variable.name}`,
    type: variable.detail && variable.detail.split('|').filter(e => e).join(', '),
  }));
}
