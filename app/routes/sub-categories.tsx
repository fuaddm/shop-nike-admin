import type { Route } from '.react-router/types/app/routes/+types/sub-categories';
import type { ColumnDef } from '@tanstack/react-table';
import { mainAPI } from '~/api/config';
import { AddNewSubCategory } from '~/components/sub-categories/AddNewSubCategory';
import { ActionsSubCategory } from '~/components/sub-categories/ActionsSubCategory';
import { SubCategoryDataTable } from '~/components/sub-categories/SubCategoryDataTable';

export type SubCategory = {
  id: number;
  name: string;
};

export const columns: ColumnDef<SubCategory>[] = [
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
    cell: ({ row, table }) => {
      return (
        <div className="float-end">
          <ActionsSubCategory
            row={row}
            mainCategories={table.options.meta!.mainCategories}
          />
        </div>
      );
    },
  },
];

export async function clientLoader() {
  const resp = await mainAPI.get('/user/sub-categories');
  const categoriesResp = await mainAPI.get('/user/categories');
  const mainCategoriesResp = await mainAPI.get('/user/main-categories');

  if (resp.statusText === 'OK') return [resp.data.data, categoriesResp.data.data, mainCategoriesResp.data.data];

  return [];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const actionMethod = formData.get('actionMethod');
  const name = formData.get('name');
  const categoryId = Number(formData.get('category') ?? '');
  const id = formData.get('id');
  const mainCategories = String(formData.get('main-categories'));

  if (actionMethod === 'add')
    await mainAPI.post(`/admin/add-sub-category?categoryId=${categoryId}&subCategoryName=${name}`, null);
  if (actionMethod === 'remove') await mainAPI.patch(`/admin/delete-sub-category?subCategoryId=${id}`, null);
  if (actionMethod === 'create-hierarchy') {
    const mainCategoryIdsAsParams = mainCategories
      .split(',')
      .map((mainCategoryId) => {
        return `mainCategoryIds=${mainCategoryId}`;
      })
      .join('&');

    await mainAPI.post(`/admin/create-hierarchy?subCategoryIds=${id}&${mainCategoryIdsAsParams}`, null);
  }

  return [];
}

export default function Categories({ loaderData }: Route.ComponentProps) {
  const subCategories = loaderData[0];
  const categories = loaderData[1];
  const mainCategories = loaderData[2];

  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">Sub Categories</div>
        <AddNewSubCategory categories={categories} />
      </div>
      <SubCategoryDataTable
        subCategories={subCategories}
        mainCategories={mainCategories}
        columns={columns}
      />
    </div>
  );
}
