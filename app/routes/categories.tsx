import type { Route } from '.react-router/types/app/routes/+types/categories';
import type { ColumnDef } from '@tanstack/react-table';
import { mainAPI } from '~/api/config';
import { AddNewCategory } from '~/components/categories/AddNewCategory';
import { RemoveCategory } from '~/components/categories/RemoveCategory';
import { DataTable } from '~/components/data-table';

export type Category = {
  id: number;
  name: string;
};

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="float-end">
          <RemoveCategory row={row} />
        </div>
      );
    },
  },
];

export async function clientLoader() {
  const token = sessionStorage.getItem('token');
  const resp = await mainAPI.get('/user/categories', {
    headers: {
      token,
    },
  });

  if (resp.statusText === 'OK') return resp.data.data as Category;

  return [];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const actionMethod = formData.get('actionMethod');
  const name = formData.get('name');
  const id = formData.get('id');
  const token = sessionStorage.getItem('token');

  if (actionMethod === 'add')
    await mainAPI.post(`/admin/add-category?categoryName=${name}`, null, {
      headers: { token },
    });
  if (actionMethod === 'update')
    await mainAPI.put(`/admin/update-category?categoryId=${id}&name=${name}`, null, { headers: { token } });
  if (actionMethod === 'remove')
    await mainAPI.patch(`/admin/delete-category?categoryId=${id}`, null, { headers: { token } });

  return [];
}

export default function Categories({ loaderData }: Route.ComponentProps) {
  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">Categories</div>
        <AddNewCategory />
      </div>
      <DataTable
        data={loaderData}
        columns={columns}
        totalRows={loaderData.length}
      />
    </div>
  );
}
