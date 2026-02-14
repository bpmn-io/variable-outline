export default function parseRows(variables) {
  return variables.map(variable => ({
    ...variable,
    id: variable.name + variable.scope.id,
    type: variable.detail && variable.detail.split('|').filter(e => e).join(', '),
  }));
}
