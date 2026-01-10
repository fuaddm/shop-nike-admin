import type { Route } from '.react-router/types/app/routes/+types/orders';
import type { ColumnDef } from '@tanstack/react-table';
import { mainAPI } from '~/api/config';
import { DataTable } from '~/components/data-table';
import { cn } from '~/lib/utils';

export const columns: ColumnDef<unknown>[] = [
  {
    accessorKey: 'promocode-id',
    header: 'ID',
    cell: ({ row }) => {
      return <div>{row.original.promoCodeId}</div>;
    },
  },
  {
    accessorKey: 'discount',
    header: 'Discount',
    cell: ({ row }) => <div>{row.original.discount}%</div>,
  },
  {
    accessorKey: 'start-date',
    header: 'Start Date',
    cell: ({ row }) => <div>{new Date(row.original.startDate).toLocaleString()}</div>,
  },
  {
    accessorKey: 'end-date',
    header: 'End Date',
    cell: ({ row }) => <div>{new Date(row.original.endDate).toLocaleString()}</div>,
  },
  {
    accessorKey: 'used',
    header: 'Used',
    cell: ({ row }) => <div>{row.original.timesUsed}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return (
        <div
          className={cn({
            'w-fit rounded-full bg-amber-600 px-3.5 py-0.5 text-xs text-white': true,
            'bg-green-500': row.original.status,
          })}
        >
          {row.original.status ? 'Active' : 'Inactive'}
        </div>
      );
    },
  },
];

export async function clientLoader() {
  try {
    const token = sessionStorage.getItem('token');
    const resp = await mainAPI.get('/admin/promo-codes', {
      headers: {
        token,
      },
    });
    if (resp.statusText === 'OK') return { items: resp.data.data };
  } catch {
    return { items: [] };
  }

  return { items: [] };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">Promocodes</div>
      </div>
      {loaderData && (
        <DataTable
          data={loaderData.items.items}
          columns={columns}
          totalRows={loaderData.items.totalCount}
        />
      )}
    </div>
  );
}
