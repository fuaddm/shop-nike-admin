import type { Route } from '.react-router/types/app/routes/+types/contents';
import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router';
import { mainAPI } from '~/api/config';
import { ActionsContent } from '~/components/contents/ActionsContent';
import { DataTable } from '~/components/data-table';
import { Button } from '~/components/ui/button';

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams({
    pageNumber: url.searchParams.get('pageNumber') || '1',
    pageSize: url.searchParams.get('pageSize') || '10',
  });
  try {
    const token = sessionStorage.getItem('token');
    const resp = await mainAPI.get(`/help/contents?${searchParams.toString()}`, {
      headers: {
        token,
      },
    });
    if (resp.statusText === 'OK') return resp.data.data;
  } catch {
    return [];
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const name = formData.get('name');
  const actionMethod = formData.get('actionMethod');
  const token = sessionStorage.getItem('token');

  if (actionMethod === 'remove') {
    try {
      await mainAPI.delete(`/help/content?name=${name}`, {
        headers: { token },
      });

      return { success: true };
    } catch (e) {
      return { success: false };
    }
  }
}

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="float-end">
          <ActionsContent row={row} />
        </div>
      );
    },
  },
];

export default function Contents({ loaderData }: Route.ComponentProps) {
  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">Contents</div>
        <Button asChild>
          <Link to="/app/new-content">ADD NEW</Link>
        </Button>
      </div>
      <DataTable
        data={loaderData.items}
        columns={columns}
        totalRows={loaderData.totalCount}
      />
    </div>
  );
}
