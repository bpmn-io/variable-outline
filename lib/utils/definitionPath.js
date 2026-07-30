import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

const EXAMPLE_OUTPUT_JSON = 'camundaModeler:exampleOutputJson';

const RESULT_VARIABLE_TYPES = [ 'zeebe:Script', 'zeebe:CalledDecision' ];

// an output mapping publishes the variable into the surrounding scope while an
// input only defines it locally, so an output is the definition we point at
const IO_MAPPING_COLLECTIONS = [ 'outputParameters', 'inputParameters' ];

/**
 * Derive the moddle property path of the location that defines `variableName` on
 * the given element - the same path shape bpmnlint rules report, and what
 * `propertiesPanel.getEntryId(element, path)` resolves to a rendered entry.
 *
 * We report where a variable is defined, never which entry renders it: that is
 * the properties panel's business, and only it knows that an element template
 * replaced a standard field with a `custom-entry-*` one.
 *
 * Covers the ways a zeebe element produces a variable:
 * - input/output mapping row → the row's `target`
 * - script task / called decision → `resultVariable`
 * - generated example data → the `camundaModeler:exampleOutputJson` value
 *
 * @param {djs.model.Base|ModdleElement} element - the producing element
 * @param {string} variableName
 *
 * @returns {Array<string|number>|null} the path, relative to the element's
 * business object, or null when nothing defines the variable
 */
export function getDefinitionPath(element, variableName) {
  const businessObject = getBusinessObject(element);

  if (!businessObject || !variableName) {
    return null;
  }

  const values = getExtensionValues(businessObject);

  return getIoMappingPath(values, variableName)
    || getResultVariablePath(values, variableName)
    || getExampleOutputPath(values, variableName);
}

function getIoMappingPath(values, variableName) {
  const index = values.findIndex(value => value.$type === 'zeebe:IoMapping');

  if (index === -1) {
    return null;
  }

  for (const collection of IO_MAPPING_COLLECTIONS) {
    const parameters = values[ index ].get(collection) || [];

    const parameterIndex = parameters.findIndex(parameter => parameter.get('target') === variableName);

    if (parameterIndex !== -1) {
      return [ 'extensionElements', 'values', index, collection, parameterIndex, 'target' ];
    }
  }

  return null;
}

function getResultVariablePath(values, variableName) {
  const index = values.findIndex(value => RESULT_VARIABLE_TYPES.includes(value.$type)
    && value.get('resultVariable') === variableName);

  if (index === -1) {
    return null;
  }

  return [ 'extensionElements', 'values', index, 'resultVariable' ];
}

function getExampleOutputPath(values, variableName) {
  const index = values.findIndex(value => value.$type === 'zeebe:Properties');

  if (index === -1) {
    return null;
  }

  const properties = values[ index ].get('properties') || [];

  const propertyIndex = properties.findIndex(property => property.get('name') === EXAMPLE_OUTPUT_JSON);

  if (propertyIndex === -1 || !definesVariable(properties[ propertyIndex ].get('value'), variableName)) {
    return null;
  }

  return [ 'extensionElements', 'values', index, 'properties', propertyIndex, 'value' ];
}

function getExtensionValues(businessObject) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return [];
  }

  return extensionElements.get('values') || [];
}

/**
 * Whether the given `camundaModeler:exampleOutputJson` value declares
 * `variableName` as a top-level key.
 *
 * @param {string} value - the raw JSON string
 * @param {string} variableName
 *
 * @returns {boolean}
 */
function definesVariable(value, variableName) {
  let exampleOutput;

  try {
    exampleOutput = JSON.parse(value || '{}');
  } catch {
    return false;
  }

  if (!exampleOutput || typeof exampleOutput !== 'object') {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(exampleOutput, variableName);
}
