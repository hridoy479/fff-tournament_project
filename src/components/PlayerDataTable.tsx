'use client';

import * as React from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Player {
  _id: string;
  user_uid: string;
  tournament_id: number;
  game_name: string;
  createdAt: string;
}

interface PlayerDataTableProps {
  data: Player[];
}

export const columns: ColumnDef<Player>[] = [
  {
    accessorKey: 'game_name',
    header: 'Game Name',
    cell: ({ row }) => <div className="capitalize">{row.getValue('game_name')}</div>,
  },
  {
    accessorKey: 'user_uid',
    header: 'User ID',
    cell: ({ row }) => <div className="lowercase">{row.getValue('user_uid')}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString();
      return (
        <div className="text-left">
          {formattedDate} {formattedTime}
        </div>
      );
    },
  },
];

export function PlayerDataTable({ data }: PlayerDataTableProps) {
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
                No players joined yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
