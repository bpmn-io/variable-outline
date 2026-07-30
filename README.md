# @bpmn-io/variable-outline

[![CI](https://github.com/bpmn-io/variable-outline/actions/workflows/CI.yml/badge.svg)](https://github.com/bpmn-io/variable-outline/actions/workflows/CI.yml)

A React component to display variables in a BPMN diagram.

## Usage

Simply add the component to your existing React application and pass the bpmn-js
`injector` to the component:

```js
import VariableOutline from '@bpmn-io/variable-outline';
import '@bpmn-io/variable-outline/dist/variable-outline.css';

export function MyComponent(props) {
  const {
    injector
  } = props;

  return <VariableOutline injector={injector}></VariableOutline>
}
```

### Revealing the Defining Field
> [!NOTE]
> Clicking the element that writes a variable also reveals the properties panel field that
> defines it. The field is resolved through `propertiesPanel#getEntryId(element, path)`, so
> this requires `bpmn-js-properties-panel@>=5.63.0`; with an older panel the click only
> selects the element. Fields contributed by element templates additionally need
> `bpmn-js-element-templates@>=2.29.0`.

### Using Carbon Styles
> [!NOTE]
> This library does not include `@carbon` styles. If you need them, you must import them into your existing SCSS file:

```scss
@use '@carbon/styles';
```

## Development

Start a demo page with `npm run start`.

Run all tests with `npm run test`

## Code of Conduct

By participating to this project, please uphold to our [Code of Conduct](https://github.com/camunda/.github/blob/main/.github/CODE_OF_CONDUCT.md).

## License

MIT

Uses [bpmn-js](https://github.com/bpmn-io/bpmn-js) licensed under the [bpmn.io license](http://bpmn.io/license).
