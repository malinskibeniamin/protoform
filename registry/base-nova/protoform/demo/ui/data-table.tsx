'use client';

import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { text: sortFn_text },
});
interface SampleRecord {
  email: string;
  id: string;
  name: string;
  status: string;
}
const records: SampleRecord[] = [
  { id: 'ada', name: 'Ada', email: 'ada@example.test', status: 'Ready' },
  { id: 'grace', name: 'Grace', email: 'grace@example.test', status: 'Ready' },
  { id: 'linus', name: 'Linus', email: 'linus@example.test', status: 'Draft' },
  { id: 'margaret', name: 'Margaret', email: 'margaret@example.test', status: 'Ready' },
  { id: 'yukihiro', name: 'Yukihiro', email: 'yukihiro@example.test', status: 'Draft' },
];
function SampleRecordActions({ record }: { record: SampleRecord }) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button aria-label={`Actions for ${record.name}`} size="icon-sm" type="button" variant="ghost">
              <MoreHorizontalIcon />
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowDetails(showDetails !== true)}>
            {showDetails === true ? 'Hide details' : 'Show details'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showDetails === true ? (
        <p className="text-sm">
          {record.name}: {record.status}
        </p>
      ) : null}
    </div>
  );
}
function sortDirection(value: false | 'asc' | 'desc'): 'ascending' | 'descending' | undefined {
  if (value === 'asc') {
    return 'ascending';
  }
  if (value === 'desc') {
    return 'descending';
  }
  return undefined;
}
const helper = createColumnHelper<typeof features, SampleRecord>();
const columns = helper.columns([
  helper.display({
    id: 'select',
    enableHiding: false,
    header: ({ table }) => (
      <Field orientation="horizontal">
        <Checkbox
          aria-label="Select page records"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
        />
      </Field>
    ),
    cell: ({ row }) => (
      <Field orientation="horizontal">
        <Checkbox
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        />
      </Field>
    ),
  }),
  helper.accessor('name', {
    filterFn: 'includesString',
    sortFn: 'text',
    header: ({ column }) => (
      <Button onClick={column.getToggleSortingHandler()} type="button" variant="ghost">
        Name
      </Button>
    ),
  }),
  helper.accessor('email', { header: 'Email' }),
  helper.accessor('status', { header: 'Status' }),
  helper.display({
    id: 'actions',
    enableHiding: false,
    header: 'Actions',
    cell: ({ row }) => <SampleRecordActions record={row.original} />,
  }),
]);

export default function DataTableExample() {
  const table = useTable({
    features,
    columns,
    data: records,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
  });
  const filterValue = table.getColumn('name')?.getFilterValue();
  const filter = typeof filterValue === 'string' ? filterValue : '';
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Field className="min-w-0 flex-1">
          <Input
            aria-label="Filter sample records"
            className="min-w-0 flex-1"
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.currentTarget.value)}
            placeholder="Filter names"
            value={filter}
          />
        </Field>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline">
                Visible columns
              </Button>
            }
          />
          <DropdownMenuContent>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  checked={column.getIsVisible()}
                  key={column.id}
                  onCheckedChange={(checked) => column.toggleVisibility(checked)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table aria-label="Sample records">
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead aria-sort={sortDirection(header.column.getIsSorted())} key={header.id}>
                  {header.isPlaceholder === true ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell className="text-center" colSpan={table.getVisibleLeafColumns().length}>
                No matching records.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow data-state={row.getIsSelected() === true ? 'selected' : undefined} key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <output aria-label="Selected record count" className="text-sm">
          {table.getSelectedRowModel().rows.length} selected
        </output>
        <div className="flex gap-2">
          <Button
            disabled={table.getCanPreviousPage() !== true}
            onClick={() => table.previousPage()}
            type="button"
            variant="outline"
          >
            Previous records
          </Button>
          <Button
            disabled={table.getCanNextPage() !== true}
            onClick={() => table.nextPage()}
            type="button"
            variant="outline"
          >
            Next records
          </Button>
        </div>
      </div>
    </div>
  );
}
