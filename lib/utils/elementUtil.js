export function getName(element) {
  return element.name || element.id;
}

export function getParents(element) {
  var parents = [ element ];
  var current = element;

  while (current.$parent) {
    parents.push(current.$parent);
    current = current.$parent;
  }

  return parents;
}