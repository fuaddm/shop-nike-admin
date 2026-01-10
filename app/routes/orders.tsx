import type { Route } from '.react-router/types/app/routes/+types/orders';
import type { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';
import { useSearchParams } from 'react-router';

import { mainAPI } from '~/api/config';
import { DataTable } from '~/components/data-table';
import { OrderActions } from '~/components/orders/order-actions';

// shadcn/ui
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

type Order = {
  orderId: string;
  userEmail: string;
  orderDate: string; // ISO string
  totalAmount: number;
  statusName: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  itemsCount: number;
};

// Sort option: 0=DateDesc, 1=DateAsc, 2=AmountDesc, 3=AmountAsc
type SortOption = '0' | '1' | '2' | '3';

// statusFilter: 0=Pending, 1=Shipped, 2=Delivered, 3=Cancelled
// NOTE: shadcn/radix SelectItem value cannot be empty string, so we use "all"
type StatusFilter = 'all' | '0' | '1' | '2' | '3';

function StatusPill({ status }: { status: string }) {
  const base = 'w-fit rounded-full px-3.5 py-0.5 text-xs text-white';

  if (status === 'Pending') return <div className={`${base} bg-amber-600`}>{status}</div>;
  if (status === 'Shipped') return <div className={`${base} bg-blue-500`}>{status}</div>;
  if (status === 'Delivered') return <div className={`${base} bg-green-500`}>{status}</div>;
  if (status === 'Cancelled') return <div className={`${base} bg-red-500`}>{status}</div>;
  return <div className={`${base} bg-gray-500`}>{status}</div>;
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderId',
    header: 'ID',
    cell: ({ row }) => <div>{row.original.orderId}</div>,
  },
  {
    accessorKey: 'userEmail',
    header: 'User Email',
    cell: ({ row }) => <div>{row.original.userEmail}</div>,
  },
  {
    accessorKey: 'orderDate',
    header: 'Date',
    cell: ({ row }) => <div>{new Date(row.original.orderDate).toLocaleString()}</div>,
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => <div>${row.original.totalAmount}</div>,
  },
  {
    accessorKey: 'statusName',
    header: 'Status',
    cell: ({ row }) => <StatusPill status={row.original.statusName} />,
  },
  {
    accessorKey: 'itemsCount',
    header: 'Items Count',
    cell: ({ row }) => <div>{row.original.itemsCount}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex justify-end">
        <OrderActions row={row} />
      </div>
    ),
  },
];

function OrdersFiltersBar() {
  const [sp, setSp] = useSearchParams();

  const startDate = sp.get('startDate') ?? '';
  const endDate = sp.get('endDate') ?? '';
  const sortOption = (sp.get('sortOption') ?? '0') as SortOption;
  const statusFilter = (sp.get('statusFilter') ?? 'all') as StatusFilter;

  const setParam = React.useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(sp);

      // reset pagination whenever filters change
      next.set('pageNumber', '1');

      next.set(key, value);
      setSp(next);
    },
    [sp, setSp]
  );

  const resetFilters = () => {
    const next = new URLSearchParams(sp);

    next.set('pageNumber', '1');
    next.delete('startDate');
    next.delete('endDate');

    // reset to defaults
    next.set('statusFilter', 'all');
    next.set('sortOption', '0');

    setSp(next);
  };

  return (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <div className="grid gap-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setParam('startDate', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setParam('endDate', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Shipping status</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setParam('statusFilter', v)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="0">Pending</SelectItem>
              <SelectItem value="1">Shipped</SelectItem>
              <SelectItem value="2">Delivered</SelectItem>
              <SelectItem value="3">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Sort</Label>
          <Select
            value={sortOption}
            onValueChange={(v) => setParam('sortOption', v)}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Select sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Date ↓ (newest first)</SelectItem>
              <SelectItem value="1">Date ↑ (oldest first)</SelectItem>
              <SelectItem value="2">Amount ↓ (highest first)</SelectItem>
              <SelectItem value="3">Amount ↑ (lowest first)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={resetFilters}
          >
            Reset filters
          </Button>
        </div>
      </div>
    </>
  );
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);

  try {
    const sortOption = url.searchParams.get('sortOption') || '0';
    const statusFilter = url.searchParams.get('statusFilter') || 'all';

    const searchParams = new URLSearchParams({
      pageNumber: url.searchParams.get('pageNumber') || '1',
      pageSize: url.searchParams.get('pageSize') || '10',
      emailSearch: url.searchParams.get('q') || '',

      // Date range filter
      startDate: url.searchParams.get('startDate') || '',
      endDate: url.searchParams.get('endDate') || '',

      // Sort option required by backend (0..3)
      sortOption,
    });

    // Only send numeric statusFilter if selected (so we don't send statusFilter=all)
    if (statusFilter !== 'all') {
      searchParams.set('statusFilter', statusFilter);
    }

    const token = sessionStorage.getItem('token');
    const resp = await mainAPI.get(`/admin/orders?${searchParams.toString()}`, {
      headers: { token },
    });

    if (resp.statusText === 'OK') {
      return {
        items: resp.data.data.items as Order[],
        totalCount: resp.data.data.totalCount as number,
      };
    }
  } catch {
    return { items: [] as Order[], totalCount: 0 };
  }

  return { items: [] as Order[], totalCount: 0 };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const actionMethod = formData.get('actionMethod');
  const orderId = String(formData.get('orderId'));
  const shippingStatus = Number(formData.get('shippingStatus'));
  const token = sessionStorage.getItem('token');

  if (actionMethod === 'update') {
    await mainAPI.patch(`/admin/orders/${orderId}/status?statusId=${shippingStatus}`, null, {
      headers: { token },
    });
  }

  if (actionMethod === 'cancel') {
    await mainAPI.patch(`/admin/orders/${orderId}/cancel`, null, {
      headers: { token },
    });
  }

  return [];
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const data = loaderData.items as Order[];
  const totalRows = loaderData.totalCount as number;

  return (
    <div className="px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-3xl font-semibold">Orders</div>
      </div>

      <div className="mb-6">
        <OrdersFiltersBar />
      </div>

      {data && (
        <DataTable
          data={data}
          columns={columns}
          totalRows={totalRows}
          searchMode="server"
        />
      )}
    </div>
  );
}
