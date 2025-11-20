import type { Route } from '.react-router/types/app/routes/+types/hierarchy-categories';
import type { ColumnDef } from '@tanstack/react-table';
import { useQueryState } from 'nuqs';
import { mainAPI } from '~/api/config';
import { DataTable } from '~/components/data-table';
import { ActionsHierarchySubCategory } from '~/components/hierarchy-categories/ActionsHierarchySubCategory';

export type Category = {
  id: number;
  name: string;
};

export type HierarchySubCategory = {
  id: number;
  name: string;
  hierarchy_id: number;
  status: boolean;
};

export const mainCategoriesColumns: ColumnDef<Category>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const [mainCategoryParam, setMainCategoryParam] = useQueryState('main-category', { history: 'push' });
      const [categoryParam, setCategoryParam] = useQueryState('category', { history: 'push' });
      const [subCategoryParam, setSubCategoryParam] = useQueryState('sub-category', { history: 'push' });

      return (
        <div
          className="cursor-pointer"
          onClick={() => {
            setMainCategoryParam(row.getValue('id'));
            setCategoryParam(null);
            setSubCategoryParam(null);
          }}
        >
          {row.getValue('name')}
        </div>
      );
    },
  },
];

export const categoriesColumns: ColumnDef<Category>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const [categoryParam, setCategoryParam] = useQueryState('category', { history: 'push' });
      const [subCategoryParam, setSubCategoryParam] = useQueryState('sub-category', { history: 'push' });

      return (
        <div
          className="cursor-pointer"
          onClick={() => {
            setCategoryParam(row.getValue('id'));
            setSubCategoryParam(null);
          }}
        >
          {row.getValue('name')}
        </div>
      );
    },
  },
];

export const subCategoriesColumns: ColumnDef<HierarchySubCategory>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'hierarchy_id',
    header: 'HIERARCHY ID',
    cell: ({ row }) => <div>{row.getValue('hierarchy_id')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div>{String(row.getValue('status'))}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const [subCategoryParam, setSubCategoryParam] = useQueryState('sub-category', { history: 'push' });

      return (
        <div
          className="cursor-pointer"
          onClick={() => {
            setSubCategoryParam(row.getValue('hierarchy_id'));
          }}
        >
          {row.getValue('name')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="float-end">
          <ActionsHierarchySubCategory row={row} />
        </div>
      );
    },
  },
];

export async function clientLoader() {
  const resp = await mainAPI.get('/admin/hierarchy-v2');

  if (resp.statusText === 'OK') return resp.data.data.hierarchies;

  return [];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const actionMethod = formData.get('actionMethod');
  const hierarchy_id = formData.get('hierarchy_id');

  if (actionMethod === 'remove') await mainAPI.patch(`/admin/delete-hierarchy?hierarchyId=${hierarchy_id}`, null);

  return [];
}

export default function HierarchyCategories({ loaderData }: Route.ComponentProps) {
  const [mainCategoryParam, setMainCategoryParam] = useQueryState('main-category');
  const [categoryParam, setCategoryParam] = useQueryState('category');
  const [subCategoryParam, setSubCategoryParam] = useQueryState('sub-category');

  function getCategoriesByMainCategoryId() {
    const mainCategory = loaderData.find((mainCtg: any) => mainCtg.id === Number(mainCategoryParam));

    return mainCategory.categories ?? [];
  }

  function getSubCategoriesByCategoryId() {
    const mainCategory = loaderData.find((mainCtg: any) => mainCtg.id === Number(mainCategoryParam));
    const category = mainCategory?.categories.find((categoryItem: any) => categoryItem.id === Number(categoryParam));

    return category?.sub_categories ?? [];
  }

  function getTitle(): 'Main' | '' | 'Sub' {
    if (mainCategoryParam === null) {
      return 'Main';
    } else if (mainCategoryParam !== null && categoryParam === null) {
      return '';
    } else if (categoryParam !== null) {
      return 'Sub';
    }

    return '';
  }

  function getCategoryName() {
    if (mainCategoryParam === null) {
      return '';
    } else if (mainCategoryParam !== null && categoryParam === null) {
      const mainCategory = loaderData.find((mainCtg: any) => mainCtg.id === Number(mainCategoryParam));

      return mainCategory?.name ?? '';
    } else if (categoryParam !== null) {
      const mainCategory = loaderData.find((mainCtg: any) => mainCtg.id === Number(mainCategoryParam));
      const category = mainCategory?.categories.find((categoryItem: any) => categoryItem.id === Number(categoryParam));

      return (mainCategory?.name ?? '') + '-' + (category?.name ?? '');
    }
  }

  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">{getTitle()} Categories</div>
      </div>
      <div className="font-semibold">{getCategoryName()}</div>
      {mainCategoryParam === null && (
        <DataTable
          data={loaderData}
          columns={mainCategoriesColumns}
        />
      )}
      <div className="mb-10"></div>
      {categoryParam === null && mainCategoryParam !== null && (
        <DataTable
          data={getCategoriesByMainCategoryId()}
          columns={categoriesColumns}
        />
      )}
      <div className="mb-10"></div>
      {categoryParam !== null && mainCategoryParam !== null && (
        <DataTable
          data={getSubCategoriesByCategoryId()}
          columns={subCategoriesColumns}
        />
      )}
    </div>
  );
}
