import type { Route } from '.react-router/types/app/routes/+types/orders';
import type { ColumnDef } from '@tanstack/react-table';
import { mainAPI } from '~/api/config';
import { DataTable } from '~/components/data-table';
import { OrderActions } from '~/components/orders/order-actions';

export const columns: ColumnDef<unknown>[] = [
  {
    accessorKey: 'order-id',
    header: 'ID',
    cell: ({ row }) => {
      return <div>{row.original.orderId}</div>;
    },
  },
  {
    accessorKey: 'email',
    header: 'User Email',
    cell: ({ row }) => <div>{row.original.userEmail}</div>,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => <div>{new Date(row.original.orderDate).toLocaleString()}</div>,
  },
  {
    accessorKey: 'total-amount',
    header: 'Total Amount',
    cell: ({ row }) => <div>${row.original.totalAmount}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      if (row.original.statusName === 'Pending') {
        return (
          <div className="w-fit rounded-full bg-amber-600 px-3.5 py-0.5 text-xs text-white">
            {row.original.statusName}
          </div>
        );
      }
      if (row.original.statusName === 'Shipped') {
        return (
          <div className="w-fit rounded-full bg-blue-500 px-3.5 py-0.5 text-xs text-white">
            {row.original.statusName}
          </div>
        );
      }
      if (row.original.statusName === 'Delivered') {
        return (
          <div className="w-fit rounded-full bg-green-500 px-3.5 py-0.5 text-xs text-white">
            {row.original.statusName}
          </div>
        );
      }
      if (row.original.statusName === 'Cancelled') {
        return (
          <div className="w-fit rounded-full bg-red-500 px-3.5 py-0.5 text-xs text-white">
            {row.original.statusName}
          </div>
        );
      }
    },
  },
  {
    accessorKey: 'items-count',
    header: 'Items Count',
    cell: ({ row }) => <div>{row.original.itemsCount}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="float-end">
          <OrderActions row={row} />
        </div>
      );
    },
  },
];

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);

  try {
    const searchParams = new URLSearchParams({
      pageNumber: url.searchParams.get('pageNumber') || '1',
      pageSize: url.searchParams.get('pageSize') || '10',
      emailSearch: url.searchParams.get('q') || '',
      statusFilter: url.searchParams.get('statusFilter') || '',
      startDate: url.searchParams.get('startDate') || '',
      endDate: url.searchParams.get('endDate') || '',
      sortBy: url.searchParams.get('sortBy') || '',
    });

    const token = sessionStorage.getItem('token');
    const resp = await mainAPI.get(`/admin/orders?${searchParams.toString()}`, {
      headers: {
        token,
      },
    });
    if (resp.statusText === 'OK') return { items: resp.data.data.items, totalCount: resp.data.data.totalCount };
  } catch {
    return { items: [] };
  }

  return { items: [] };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const actionMethod = formData.get('actionMethod');
  const orderId = String(formData.get('orderId'));
  const shippingStatus = Number(formData.get('shippingStatus'));
  const token = sessionStorage.getItem('token');

  if (actionMethod === 'update')
    await mainAPI.patch(`/admin/orders/${orderId}/status?statusId=${shippingStatus}`, null, { headers: { token } });
  if (actionMethod === 'cancel') await mainAPI.patch(`/admin/orders/${orderId}/cancel`, null, { headers: { token } });

  return [];
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const data = loaderData.items;
  const totalRows = loaderData.totalCount;

  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">Orders</div>
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
