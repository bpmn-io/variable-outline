// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';

import { Accordion, AccordionItem, DataTable, Tooltip } from '@carbon/react';

import Element from './Element';
import Variable from './Variable';
import Origin from './Origin';

import './VariableTable.scss';
import useService from '../../hooks/useService';
import { Db2Database } from '@carbon/icons-react';

const HEADERS = [
  { header: 'Name', key: 'name' },
  { header: 'Type', key: 'type' },
  { header: 'Scope', key: 'scope' },
  { header: 'Origin', key: 'origin' }
];

const {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} = DataTable;

function Variables(
    {
      variables
    }
) {

  const rows = variables.map(variable => {
    return {
      ...variable,
      name: {
        component: <Variable variable={ variable } />,
        value: variable.name
      },
      id: variable.name + variable.scope.id,
      type: variable.detail && variable.detail.split('|').filter(e=>e).join(', '),
      scope: {
        component: <Element element={ variable.scope } />,
        value: variable.scope
      },
      origin: {
        component: <Origin origins={ variable.origin } />,
        value: variable.origin
      }
    };
  });

  // divide into global and local, a variable is local if it's scope is the selected element, otherwise global

  console.log('VARIABLE ROWS', rows);

  const selection = useService('selection');
  const selectedElements = selection.get();

  const localRows = rows.filter(row => {
    return selectedElements.some(el => el.id === row.scope.value.id);
  });

  const globalRows = rows.filter(row => {
    return !selectedElements.some(el => el.id === row.scope.value.id);
  });

  const [globalOpen, setGlobalOpen] = useState(globalRows.length > 0);
  const [localOpen, setLocalOpen] = useState(localRows.length > 0);

  return <div className="accordion-container">
    <div className="accordion-container-inner">
      <Accordion className="accordion-category">
        <AccordionItem title={ <div class="variables-category"><span><Db2Database/>Global variables</span><span>{globalRows.length}</span></div> } open={ globalOpen } onHeadingClick={() => setGlobalOpen(!globalOpen)}>
        </AccordionItem>
      </Accordion>
      {
        globalOpen && <Accordion>
          {
            globalRows.map(row => {
              const highlight = selectedElements.some(el => row.origin?.value?.find(value => value.id === el.id));

              return <AccordionItem key={ row.id } className={ highlight ? 'variable-highlight' : '' } title={ <div className="variable-header"><span className="variable-name">{row.name?.value}</span> <span className="variable-type-tag">{row.type}</span></div> } open={ false }>
                <p>Value: <span className="mono">{ row.info || '-' }</span></p>
                <p>Written in: <span className="mono">{ row.origin?.value?.map(moddleElement => moddleElement.id).join(', ') || '-' }</span></p>
              </AccordionItem>;
            })
          }
          {
            globalRows.length === 0 && <p className="no-variables-found">No global variables found.</p>
          }
        </Accordion>
      }
      <Accordion className="accordion-category">
        <AccordionItem title={ <div class="variables-category"><span><Db2Database/>Local variables</span><span>{localRows.length}</span></div> } open={ localOpen } onHeadingClick={() => setLocalOpen(!localOpen)}>
        </AccordionItem>
      </Accordion>
      {
        localOpen && <Accordion>
            {
              localRows.map(row => {
                return <AccordionItem key={ row.id } title={ <div className="variable-header"><span className="variable-name">{row.name?.value}</span> <span className="variable-type-tag">{row.type}</span></div> } open={ false }>
                  <p>Value: <span className="mono">{ row.info || '-' }</span></p>
                  <p>Written in: <span className="mono">{ row.origin?.value?.map(moddleElement => moddleElement.id).join(', ') || '-' }</span></p>
                </AccordionItem>;
              })
            }
            {
              localRows.length === 0 && <p className="no-variables-found">No local variables found.</p>
            }
          </Accordion>
      }
    </div>
  </div>;

  return <div className="bio-vo-variable-table">
    <Tooltip align="bottom-start" label="Variables associated with the currently selected element">
      <div className="bio-vo-label bio-vo-tooltip-wrapper">Variables</div>
    </Tooltip>
    <DataTable rows={ rows } headers={ HEADERS } isSortable sortRow={ customSort }>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
        <Table { ...getTableProps() }>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader { ...getHeaderProps({ header }) } key={ getHeaderProps({ header }).key }>
                  {header.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => <TableRow { ...getRowProps({ row }) } key={ getRowProps({ row }).key }>
              {row.cells.map((cell) => (
                <TableCell key={ cell.id }>{cell?.value?.component || cell.value }</TableCell>
              ))}
            </TableRow>
            ) }
          </TableBody>
        </Table>
      )}
    </DataTable>
  </div>;
}

export default Variables;


const customSort = function(cellA, cellB, { sortDirection, sortStates, locale, key }) {
  let valueA, valueB;

  switch (key) {
  case 'scope':
    valueA = cellA.value.name || cellA.value.id;
    valueB = cellB.value.name || cellB.value.id;
    break;
  case 'origin':
    valueA = cellA.value.map(origin => origin.name || origin.id).join(', ');
    valueB = cellB.value.map(origin => origin.name || origin.id).join(', ');
    break;
  default:
    valueA = cellA?.value || cellA || '';
    valueB = cellB?.value || cellB || '';
  }

  if (sortDirection === sortStates.DESC) {
    return valueB.localeCompare(valueA, locale);
  }

  return valueA.localeCompare(valueB, locale);
};