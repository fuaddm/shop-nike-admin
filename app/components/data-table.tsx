import * as React from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type SearchMode = 'client' | 'server';

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];

  /**
   * Total rows across ALL pages (from backend).
   * Needed to compute pageCount.
   */
  totalRows: number;

  /**
   * Query param keys (optional).
   */
  pageParamKey?: string; // default: "pageNumber"
  pageSizeParamKey?: string; // default: "pageSize"
  searchParamKey?: string; // default: "q"

  /**
   * Page size options for the UI.
   */
  pageSizeOptions?: number[];

  /**
   * Search behavior:
   * - 'client': filter rows in the browser (TanStack getFilteredRowModel + globalFilter)
   * - 'server': do NOT filter client-side; only write q=... to URL and expect backend to return filtered data
   */
  searchMode?: SearchMode;

  /**
   * Show/hide the search UI
   */
  enableSearch?: boolean;
};

export function DataTable<TData>({
  data,
  columns,
  totalRows,
  pageParamKey = 'pageNumber',
  pageSizeParamKey = 'pageSize',
  searchParamKey = 'q',
  pageSizeOptions = [10, 20, 50, 100],
  searchMode = 'client',
  enableSearch = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  // -------------------------
  // URL state (single source)
  // -------------------------
  const querySchema = React.useMemo(() => {
    return {
      [pageParamKey]: parseAsInteger.withDefault(1),
      [pageSizeParamKey]: parseAsInteger.withDefault(pageSizeOptions[0] ?? 10),
      [searchParamKey]: parseAsString.withDefault(''),
    } as Record<string, any>;
  }, [pageParamKey, pageSizeParamKey, searchParamKey, pageSizeOptions]);

  const [query, setQuery] = useQueryStates(querySchema, {
    shallow: false,
    history: 'push',
  });

  const urlPage1Based = (query[pageParamKey] as number) ?? 1;
  const urlPageSize = (query[pageSizeParamKey] as number) ?? pageSizeOptions[0] ?? 10;
  const urlSearch = (query[searchParamKey] as string) ?? '';

  // Local input value (type freely; commit on Enter/button)
  const [searchInput, setSearchInput] = React.useState<string>(urlSearch);

  // Keep local input in sync if URL changes (back/forward navigation)
  React.useEffect(() => {
    setSearchInput(urlSearch);

    // ONLY apply globalFilter when search is client-side
    if (searchMode === 'client') {
      setGlobalFilter(urlSearch);
    }
  }, [urlSearch, searchMode]);

  // TanStack uses 0-based pageIndex
  const pagination: PaginationState = React.useMemo(
    () => ({
      pageIndex: Math.max(0, urlPage1Based - 1),
      pageSize: urlPageSize,
    }),
    [urlPage1Based, urlPageSize]
  );

  const pageCount = React.useMemo(() => {
    const size = pagination.pageSize || 1;
    return Math.max(1, Math.ceil(totalRows / size));
  }, [totalRows, pagination.pageSize]);

  const setUrlPage = React.useCallback(
    (nextPage1Based: number) => {
      const clamped = Math.min(Math.max(nextPage1Based, 1), pageCount);
      void setQuery((prev) => ({
        ...prev,
        [pageParamKey]: clamped,
      }));
    },
    [pageCount, pageParamKey, setQuery]
  );

  const setUrlPageSize = React.useCallback(
    (nextSize: number) => {
      const size = Math.max(1, nextSize);
      void setQuery((prev) => ({
        ...prev,
        [pageSizeParamKey]: size,
        [pageParamKey]: 1, // reset on size change
      }));
    },
    [pageParamKey, pageSizeParamKey, setQuery]
  );

  const commitSearch = React.useCallback(() => {
    const next = (searchInput ?? '').trim();

    // Key point: for BOTH modes we only write q=... to URL (backend can read it)
    // For client mode, the effect above will also setGlobalFilter(urlSearch) after URL updates.
    void setQuery((prev) => ({
      ...prev,
      [searchParamKey]: next,
      [pageParamKey]: 1, // reset page on new search
    }));
  }, [pageParamKey, searchInput, searchParamKey, setQuery]);

  const clearSearch = React.useCallback(() => {
    setSearchInput('');
    void setQuery((prev) => ({
      ...prev,
      [searchParamKey]: '',
      [pageParamKey]: 1,
    }));
  }, [pageParamKey, searchParamKey, setQuery]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,

    // Only include globalFilter state in client mode
    state: {
      sorting,
      pagination,
      ...(searchMode === 'client' ? { globalFilter } : {}),
    } as any,

    ...(searchMode === 'client'
      ? {
          onGlobalFilterChange: setGlobalFilter,
          getFilteredRowModel: getFilteredRowModel(),
        }
      : {}),

    // table models
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // pagination: manual because data is already paged by backend
    manualPagination: true,
    pageCount,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;

      // If pageSize changes, do one update and reset page
      if (next.pageSize !== pagination.pageSize) {
        void setQuery((prev) => ({
          ...prev,
          [pageSizeParamKey]: next.pageSize,
          [pageParamKey]: 1,
        }));
        return;
      }

      // pageIndex is 0-based -> store as 1-based in URL
      void setQuery((prev) => ({
        ...prev,
        [pageParamKey]: next.pageIndex + 1,
      }));
    },
  });

  const canPrev = pagination.pageIndex > 0;
  const canNext = pagination.pageIndex + 1 < pageCount;

  return (
    <div className="w-full space-y-3">
      {/* Search bar */}
      {enableSearch ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <form
            className="flex w-full items-center gap-2 sm:max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              commitSearch();
            }}
          >
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search…"
              className="h-9"
            />
            <Button
              type="submit"
              size="sm"
              className="h-9"
            >
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={clearSearch}
              disabled={!urlSearch}
            >
              Clear
            </Button>
          </form>

          <div className="text-muted-foreground text-sm">
            Page <span className="font-medium">{pagination.pageIndex + 1}</span> of{' '}
            <span className="font-medium">{pageCount}</span> • <span className="font-medium">{totalRows}</span> results
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">
          Page <span className="font-medium">{pagination.pageIndex + 1}</span> of{' '}
          <span className="font-medium">{pageCount}</span> • <span className="font-medium">{totalRows}</span> results
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Rows</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(v) => setUrlPageSize(Number(v))}
            >
              <SelectTrigger className="h-9 w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((s) => (
                  <SelectItem
                    key={s}
                    value={String(s)}
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUrlPage(1)}
              disabled={!canPrev}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUrlPage(pagination.pageIndex)}
              disabled={!canPrev}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUrlPage(pagination.pageIndex + 2)}
              disabled={!canNext}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUrlPage(pageCount)}
              disabled={!canNext}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
