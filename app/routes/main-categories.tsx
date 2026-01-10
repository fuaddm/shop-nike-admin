import type { Route } from '.react-router/types/app/routes/+types/main-categories';
import type { ColumnDef } from '@tanstack/react-table';
import { mainAPI } from '~/api/config';
import { DataTable } from '~/components/data-table';
import { AddNewMainCategory } from '~/components/main-categories/AddNewMainCategory';
import { RemoveMainCategory } from '~/components/main-categories/RemoveMainCategory';

export type MainCategory = {
  id: number;
  name: string;
};

export const columns: ColumnDef<MainCategory>[] = [
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
          <RemoveMainCategory row={row} />
        </div>
      );
    },
  },
];

export async function clientLoader() {
  const token = sessionStorage.getItem('token');
  const resp = await mainAPI.get('/user/main-categories', { headers: { token } });

  if (resp.statusText === 'OK') return resp.data.data as MainCategory;

  return [];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const actionMethod = formData.get('actionMethod');
  const name = formData.get('name');
  const id = formData.get('id');
  const token = sessionStorage.getItem('token');

  if (actionMethod === 'add')
    await mainAPI.post(`/admin/add-main-category?mainCategoryName=${name}`, null, { headers: { token } });
  if (actionMethod === 'update')
    await mainAPI.put(`/admin/update-main-category?mainCategoryId=${id}&name=${name}`, null, { headers: { token } });
  if (actionMethod === 'remove')
    await mainAPI.patch(`/admin/delete-main-category?mainCategoryId=${id}`, null, { headers: { token } });

  return [];
}

export default function MainCategories({ loaderData }: Route.ComponentProps) {
  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">Main Categories</div>
        <AddNewMainCategory />
      </div>
      <DataTable
        data={loaderData}
        columns={columns}
        totalRows={loaderData.length}
      />
    </div>
  );
}
