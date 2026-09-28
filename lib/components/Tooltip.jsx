import {
  Tooltip as DSTooltip,
  TooltipContent,
  TooltipTrigger
} from '@camunda/design-system';

/**
 * Design system tooltip around a single trigger element.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.label
 * @param {import('react').ReactElement} props.children - trigger, must accept a ref
 * @param {'top'|'right'|'bottom'|'left'} [props.side='bottom']
 */
export default function Tooltip({ label, children, side = 'bottom' }) {
  return (
    <DSTooltip>
      <TooltipTrigger asChild>{ children }</TooltipTrigger>
      <TooltipContent side={ side } className="max-w-xs px-3 py-2 text-sm">{ label }</TooltipContent>
    </DSTooltip>
  );
}
