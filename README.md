# @bpmn-io/variable-outline

[![CI](https://github.com/bpmn-io/variable-outline/actions/workflows/CI.yml/badge.svg)](https://github.com/bpmn-io/variable-outline/actions/workflows/CI.yml)

A React component to display variables in a BPMN diagram.

## Usage

Simply add the component to your existing React application and pass the bpmn-js
`injector` to the component:

```js
import VariableOutline from '@bpmn-io/variable-outline';
import '@bpmn-io/variable-outline/dist/style.css';

export function MyComponent(props) {
  const {
    injector
  } = props;

  return <VariableOutline injector={injector}></VariableOutline>
}
```

### Using Carbon Styles

Note: This library does not include @carbon/react styles. If you need them, you must import them into your existing SCSS file:

```scss
@use '@carbon/react/scss/zone';
@use '@carbon/react/scss/reset';
```

## Development

Start a demo page with `npm run start`.

Run all tests with `npm run test`

## Code of Conduct

By participating to this project, please uphold to our [Code of Conduct](https://github.com/camunda/.github/blob/main/.github/CODE_OF_CONDUCT.md).

## License

MIT

Uses [bpmn-js](https://github.com/bpmn-io/bpmn-js) licensed under the [bpmn.io license](http://bpmn.io/license).
