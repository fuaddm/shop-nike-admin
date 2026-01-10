import type { Route } from '.react-router/types/app/routes/+types/products';
import type { ColumnDef } from '@tanstack/react-table';
import { mainAPI } from '~/api/config';
import { DataTable } from '~/components/data-table';
import { ActionsProduct } from '~/components/products/ActionsProduct';
import { AddNewProduct } from '~/components/products/AddNewProduct';

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);

  const searchParams = {
    mainCategoryId: url.searchParams.get('MainCategoryId'),
    categoryId: url.searchParams.get('CategoryId'),
    subCategoryId: url.searchParams.get('SubCategoryId'),
    fabric: null,
    keywords: null,
    productName: url.searchParams.get('q'),
    clothingGenderId: url.searchParams.getAll('ClothingGenderId'),
    priceRangeId: url.searchParams.get('PriceRangeId'),
    colorId: url.searchParams.getAll('ColorId'),
    sortId: url.searchParams.get('SortId'),
    pageNumber: url.searchParams.get('pageNumber') ?? 1,
    pageSize: url.searchParams.get('pageSize') ?? 10,
  };

  try {
    const token = sessionStorage.getItem('token');
    const subCategoriesResp = await mainAPI.get('/user/sub-categories', { headers: { token } });
    const mainCategoriesResp = await mainAPI.get('/user/main-categories', { headers: { token } });
    try {
      const productsResp = await mainAPI.post('/user/search', searchParams, { headers: { token } });
      return [productsResp.data.data, subCategoriesResp.data.data, mainCategoriesResp.data.data];
    } catch {
      return [[], subCategoriesResp.data.data, mainCategoriesResp.data.data];
    }
  } catch {
    return [];
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const actionMethod = formData.get('actionMethod');
  console.log(Array.from(formData.entries()));
  let sizeQuantities = JSON.parse(formData.get('sizeQuantities') as string);
  const token = sessionStorage.getItem('token');

  sizeQuantities = sizeQuantities?.map((sizeQuantity: any) => ({
    size: sizeQuantity.size,
    quantity: sizeQuantity.quantity,
  }));

  if (actionMethod === 'add')
    await mainAPI.post(
      `/admin/add-product`,
      {
        mainCategoryId: formData.get('mainCategoryId'),
        subCategoryId: formData.get('subCategoryId'),
        productName: formData.get('productName'),
        genderId: formData.get('genderId'),
        make: formData.get('make'),
        fabric: formData.get('fabric'),
        description: formData.get('description'),
        colorCode: formData.get('colorCode'),
        price: formData.get('price'),
        sizeQuantities,
      },
      { headers: { token } }
    );
  else if (actionMethod === 'add-variation')
    await mainAPI.post(
      `/admin/add-product-variations`,
      {
        productId: formData.get('productId'),
        make: formData.get('make'),
        fabric: formData.get('fabric'),
        description: formData.get('description'),
        colorId: formData.get('colorCode'),
        price: formData.get('price'),
        sizeQuantities,
      },
      { headers: { token } }
    );
  else if (actionMethod === 'get-info')
    return await mainAPI.get(`/user/product-info?variationCode=${formData.get('variationCode')}`, {
      headers: { token },
    });
  else if (actionMethod === 'add-images') {
    const postFormData = new FormData();
    postFormData.append('productVariationId', String(formData.get('productVariationId')));

    const images = formData.getAll('images');
    images.forEach((file) => {
      postFormData.append('images', file);
    });

    return await mainAPI.post('/admin/add-images', postFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        token,
      },
    });
  }

  return [];
}

export interface Product {
  id: string;
  name: string;
  image: string;
  mainCategory: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  gender: {
    id: number;
    name: string;
  };
  colors: number;
  pricing: {
    price: number;
    promo: {
      code: string | null;
      discount: number;
    };
  };
  variations: {
    code: string;
    image: string;
  }[];
}

export const columns: ColumnDef<Product>[] = [
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
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => <div>{row.original.pricing.price}</div>,
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => <div>{row.original.gender.name}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <div>{row.original.category.name}</div>,
  },
  {
    accessorKey: 'mainCategory',
    header: 'Main Category',
    cell: ({ row }) => <div>{row.original.mainCategory.name}</div>,
  },
  {
    accessorKey: 'variationCount',
    header: 'Variation Count',
    cell: ({ row }) => <div>{row.original.variations.length}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="float-end">
          <ActionsProduct row={row} />
        </div>
      );
    },
  },
];

export default function Products({ loaderData }: Route.ComponentProps) {
  console.log(loaderData[0]);

  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">Products</div>
        <AddNewProduct data={[loaderData[1], loaderData[2]]} />
      </div>
      <DataTable
        columns={columns}
        data={loaderData[0].items}
        totalRows={loaderData[0].totalCount}
        searchMode="server"
      />
    </div>
  );
}
