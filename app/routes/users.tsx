import type { Route } from '.react-router/types/app/routes/+types/users';
import type { ColumnDef } from '@tanstack/react-table';
import { mainAPI } from '~/api/config';
import { DataTable } from '~/components/data-table';
import { cn } from '~/lib/utils';

export const columns: ColumnDef<unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return <div>{row.original.id}</div>;
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div>{row.original.email}</div>,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <div>{row.original.role}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return (
        <div
          className={cn({
            'w-fit rounded-full px-3.5 py-0.5 text-xs text-white': true,
            'bg-green-500': row.original.status === 'active',
            'bg-red-500': row.original.status === 'removed',
          })}
        >
          {row.original.status}
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
      emailSearch: url.searchParams.get('emailSearch') || '',
      statusId: url.searchParams.get('statusId') || '',
    });
    const token = sessionStorage.getItem('token');
    const resp = await mainAPI.get(`/admin/users?${searchParams.toString()}`, {
      headers: {
        token,
      },
    });
    console.log(resp.data);
    if (resp.statusText === 'OK') return { items: resp.data.data };
  } catch {
    return { items: [] };
  }

  return { items: [] };
}

export default function Users({ loaderData }: Route.ComponentProps) {
  const data = loaderData.items;

  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">Users</div>
      </div>
      {data && (
        <DataTable
          data={data.items}
          columns={columns}
          totalRows={data.totalCount}
        />
      )}
    </div>
  );
}
