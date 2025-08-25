'use client';

import * as React from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TournamentResult {
  game_name: string;
  rank: number;
  score: number;
  // Add other relevant fields for results
}

interface TournamentResultsTableProps {
  data: TournamentResult[];
}

export const columns: ColumnDef<TournamentResult>[] = [
  {
    accessorKey: 'game_name',
    header: 'Game Name',
    cell: ({ row }) => <div className="capitalize">{row.getValue('game_name')}</div>,
  },
  {
    accessorKey: 'rank',
    header: 'Rank',
    cell: ({ row }) => <div className="font-medium">{row.getValue('rank')}</div>,
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => <div className="text-right">{row.getValue('score')}</div>,
  },
];

export function TournamentResultsTable({ data }: TournamentResultsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results available yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
