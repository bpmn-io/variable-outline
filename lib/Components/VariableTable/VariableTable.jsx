// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';

import { DataTable, Tooltip } from '@carbon/react';

import Element from './Element';
import Variable from './Variable';
import Origin from './Origin';

import './VariableTable.scss';

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


  return <div className="bio-vo-variable-table">
    <Tooltip align="bottom-start" label="Elements that create or write variables">
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