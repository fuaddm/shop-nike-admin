import type { Route } from '.react-router/types/app/routes/+types/add-new-product';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Form, redirect, useActionData } from 'react-router';
import { toast } from 'sonner';
import { mainAPI } from '~/api/config';
import { CategoryComboBox } from '~/components/sub-categories/CategoryComboBox';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

const GENDERS = [
  { id: 1, name: 'Men' },
  { id: 2, name: 'Women' },
  { id: 3, name: 'Unisex' },
];

const COLOR_CODES = [
  { id: '#000000', name: 'Black' },
  { id: '#000080', name: 'Navy' },
  { id: '#0000ff', name: 'Blue' },
  { id: '#008000', name: 'Dark Green' },
  { id: '#008080', name: 'Teal' },
  { id: '#00ff00', name: 'Green' },
  { id: '#00ffff', name: 'Cyan' },
  { id: '#08a4a7', name: 'Teal' },
  { id: '#131c31', name: 'Dark Midnight Blue' },
  { id: '#416aa3', name: 'Steel Blue' },
  { id: '#6c6377', name: 'Dark Purple' },
  { id: '#800000', name: 'Maroon' },
  { id: '#800080', name: 'Purple' },
  { id: '#808000', name: 'Olive' },
  { id: '#808080', name: 'Gray' },
  { id: '#8a2be2', name: 'Blue Violet' },
  { id: '#a52a2a', name: 'Brown' },
  { id: '#b3b7bf', name: 'Light Slate Gray' },
  { id: '#f67c41', name: 'Orange Red' },
  { id: '#fbe9d2', name: 'Peach Puff' },
  { id: '#ff0000', name: 'Red' },
  { id: '#ff00ff', name: 'Magenta' },
  { id: '#ff4500', name: 'Orange Red' },
  { id: '#FFA07A', name: 'Light Salmon' },
  { id: '#ffbe98', name: 'Light Coral' },
  { id: '#ffff00', name: 'Yellow' },
  { id: '#ffffff', name: 'White' },
];

type ComboOption = { id: string | number; name: string };

interface SizeQuantities {
  id: string;
  size: string;
  quantity: number;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * hierarchy-v2 types
 */
type HierarchySubCategory = {
  hierarchy_id: number;
  id: number;
  name: string;
  status: boolean;
};

type HierarchyCategory = {
  id: number;
  name: string;
  sub_categories?: HierarchySubCategory[];
};

type HierarchyNode = {
  id: number;
  name: string;
  categories?: HierarchyCategory[];
};

type ActionData = { error?: string };

/**
 * LOADER
 * Fetch hierarchy-v2 and normalize response
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const token = sessionStorage.getItem('token');
    const res = await mainAPI.get('/admin/hierarchy-v2', { headers: { token } });

    const hierarchy = res?.data.data.hierarchies;
    return { hierarchy };
  } catch {
    return { hierarchy: [] as HierarchyNode[] };
  }
}

/**
 * ACTION
 */
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const token = sessionStorage.getItem('token');

  try {
    let sizeQuantitiesRaw: any[] = [];
    try {
      sizeQuantitiesRaw = JSON.parse(String(formData.get('sizeQuantities') ?? '[]'));
    } catch {
      sizeQuantitiesRaw = [];
    }

    const payload = {
      mainCategoryId: Number(formData.get('mainCategoryId') ?? 0),
      subCategoryId: Number(formData.get('subCategoryId') ?? 0),

      productName: String(formData.get('productName') ?? ''),
      genderId: Number(formData.get('genderId') ?? 0),
      price: Number(formData.get('price') ?? 0),

      // ✅ safer defaults (prevents "null" strings)
      make: String(formData.get('make') ?? ''),
      fabric: String(formData.get('fabric') ?? ''),
      description: String(formData.get('description') ?? ''),
      colorCode: String(formData.get('colorCode') ?? ''),

      sizeQuantities: (sizeQuantitiesRaw ?? []).map((sq: any) => ({
        size: String(sq.size ?? ''),
        quantity: Number(sq.quantity ?? 0),
      })),
    };

    console.log(payload);

    await mainAPI.post('/admin/add-product', payload, { headers: { token } });

    return redirect('/app/products');
  } catch (error: any) {
    return {
      error: error?.response?.data?.message || error?.message || 'Failed to add product.',
    } satisfies ActionData;
  }
}

export default function AddNewProductPage({ loaderData }: Route.ComponentProps) {
  const { hierarchy } = loaderData as { hierarchy: HierarchyNode[] };
  const actionData = useActionData() as ActionData | undefined;

  useEffect(() => {
    if (actionData?.error) toast.error(actionData.error);
  }, [actionData?.error]);

  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities[]>([
    { id: generateUUID(), size: '', quantity: 0 },
  ]);

  // Two-level selection
  const [mainCategoryId, setMainCategoryId] = useState<number | ''>('');
  const [subCategoryId, setSubCategoryId] = useState<number | ''>(''); // hierarchy_id

  const safeHierarchy = Array.isArray(hierarchy) ? hierarchy : [];

  // Main categories: Men / Women / Kids / ...
  const mainCategoryOptions: ComboOption[] = useMemo(
    () => safeHierarchy.map((n) => ({ id: n.id, name: n.name })),
    [safeHierarchy]
  );

  // Flatten ALL sub_categories under selected main category
  const subCategoryOptions: ComboOption[] = useMemo(() => {
    const selected = safeHierarchy.find((n) => n.id === mainCategoryId);
    if (!selected) return [];

    return (selected.categories ?? [])
      .flatMap((c) => c.sub_categories ?? [])
      .filter((s) => s.status)
      .map((s) => ({
        id: s.id,
        name: s.name,
      }));
  }, [safeHierarchy, mainCategoryId]);

  // Reset subcategory when main changes
  useEffect(() => {
    setSubCategoryId('');
  }, [mainCategoryId]);

  return (
    <div className="px-6 py-10">
      <div className="mb-8">
        <div className="text-3xl font-semibold">Add new product</div>
        <div className="text-muted-foreground text-sm">Create a new product</div>
      </div>

      <Form method="POST">
        <input
          type="hidden"
          name="sizeQuantities"
          value={JSON.stringify(sizeQuantities)}
        />

        <div className="grid gap-4">
          {/* MAIN CATEGORY */}
          <div className="grid gap-3">
            <Label>Main Category</Label>
            <CategoryComboBox
              categories={mainCategoryOptions}
              inputName="mainCategoryId"
              value={mainCategoryId}
              onChange={(v) => setMainCategoryId(v ? Number(v) : '')}
            />
          </div>

          {/* SUB CATEGORY */}
          <div className="grid gap-3">
            <Label>Sub Category</Label>
            <CategoryComboBox
              categories={subCategoryOptions}
              inputName="subCategoryId"
              value={subCategoryId}
              onChange={(v) => setSubCategoryId(v ? Number(v) : '')}
              disabled={!mainCategoryId}
              placeholder={!mainCategoryId ? 'Select main category first...' : 'Select value...'}
            />
          </div>

          <div className="grid gap-3">
            <Label>Name</Label>
            <Input name="productName" />
          </div>

          <div className="grid gap-3">
            <Label>Gender</Label>
            <CategoryComboBox
              categories={GENDERS}
              inputName="genderId"
            />
          </div>

          {/* ✅ MISSING FIELDS ADDED */}
          <div className="grid gap-3">
            <Label>Make</Label>
            <Input name="make" />
          </div>

          <div className="grid gap-3">
            <Label>Fabric</Label>
            <Input name="fabric" />
          </div>

          <div className="grid gap-3">
            <Label>Description</Label>
            <textarea
              name="description"
              className="rounded-md border border-gray-200 px-4 py-2 text-sm"
              rows={3}
            />
          </div>

          <div className="grid gap-3">
            <Label>Color code</Label>
            <CategoryComboBox
              categories={COLOR_CODES}
              inputName="colorCode"
            />
          </div>

          <div className="grid gap-3">
            <Label>Price</Label>
            <Input
              type="number"
              name="price"
            />
          </div>

          <div className="grid gap-5 pt-2">
            <div className="text-xl font-medium">Size quantities</div>

            {sizeQuantities.map((sq, index) => (
              <div
                key={sq.id}
                className="grid grid-cols-[1fr_1fr_44px] items-end gap-3"
              >
                <div className="grid gap-2">
                  <Label>Size</Label>
                  <Input
                    value={sq.size}
                    onChange={(e) =>
                      setSizeQuantities((prev) => {
                        const next = [...prev];
                        next[index] = { ...next[index], size: e.target.value };
                        return next;
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={sq.quantity}
                    onChange={(e) =>
                      setSizeQuantities((prev) => {
                        const next = [...prev];
                        next[index] = { ...next[index], quantity: Number(e.target.value) };
                        return next;
                      })
                    }
                  />
                </div>

                {index !== 0 ? (
                  <button
                    type="button"
                    onClick={() => setSizeQuantities((prev) => prev.filter((item) => item.id !== sq.id))}
                    className="group w-fit cursor-pointer rounded-md bg-gray-200 p-2"
                  >
                    <Trash2
                      size={20}
                      className="stroke-gray-500 group-hover:stroke-red-400"
                    />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={() => setSizeQuantities((prev) => [...prev, { id: generateUUID(), size: '', quantity: 0 }])}
            >
              Add
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => history.back()}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
