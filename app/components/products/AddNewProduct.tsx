import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Form } from 'react-router';
import { CategoryComboBox } from '~/components/sub-categories/CategoryComboBox';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
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

interface SizeQuantities {
  id: string;
  size: string;
  quantity: string;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function AddNewProduct({ data }: { data: any }) {
  const [subCategories, mainCategories] = data;

  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities[]>([
    { id: generateUUID(), size: '', quantity: '0' },
  ]);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add new Product</Button>
        </DialogTrigger>
        <DialogContent className="max-h-screen overflow-y-scroll sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Product</DialogTitle>
            <DialogDescription>Add new "Product"</DialogDescription>
          </DialogHeader>
          <Form
            method="POST"
            navigate={false}
          >
            <input
              type="hidden"
              name="actionMethod"
              value="add"
            />
            <input
              type="hidden"
              name="sizeQuantities"
              value={JSON.stringify(sizeQuantities)}
            />
            <div className="mb-4 grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">Main Category</Label>
                <CategoryComboBox
                  categories={mainCategories}
                  inputName="mainCategoryId"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-2">Sub Category</Label>
                <CategoryComboBox
                  categories={subCategories}
                  inputName="subCategoryId"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-3">Name</Label>
                <Input
                  id="name-3"
                  name="productName"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-4">Gender</Label>
                <CategoryComboBox
                  categories={GENDERS}
                  inputName="genderId"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-5">Make</Label>
                <Input
                  id="name-5"
                  name="make"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-6">Fabric</Label>
                <Input
                  id="name-6"
                  name="fabric"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-7">Description</Label>
                <textarea
                  id="name-7"
                  name="description"
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-8">Color code</Label>
                <CategoryComboBox
                  categories={COLOR_CODES}
                  inputName="colorCode"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-9">Price</Label>
                <Input
                  id="name-9"
                  type="number"
                  name="price"
                />
              </div>
              <div className="grid gap-5">
                <div className="text-xl font-medium">Size quantities</div>
                {sizeQuantities?.map((sizeQuantity, index) => {
                  return (
                    <div
                      key={sizeQuantity.id}
                      className="grid grid-cols-[1fr_1fr_44px] items-end gap-3"
                    >
                      <div className="grid gap-2">
                        <Label htmlFor="">Size</Label>
                        <Input
                          defaultValue={sizeQuantity.size}
                          onChange={(e) =>
                            setSizeQuantities((prev) => {
                              prev[index] = {
                                ...prev[index],
                                size: e.target.value,
                              };
                              return [...prev];
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="">Quantity</Label>
                        <Input
                          defaultValue={sizeQuantity.quantity}
                          onChange={(e) =>
                            setSizeQuantities((prev) => {
                              prev[index] = {
                                ...prev[index],
                                quantity: e.target.value,
                              };
                              return [...prev];
                            })
                          }
                        />
                      </div>
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSizeQuantities((prev) => {
                              const filteredPrev = prev.filter((item) => item.id !== sizeQuantity.id);
                              return [...filteredPrev];
                            });
                          }}
                          className="group w-fit cursor-pointer rounded-md bg-gray-200 p-2"
                        >
                          <Trash2
                            size={20}
                            className="stroke-gray-500 transition group-hover:stroke-red-400"
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
                <Button
                  type="button"
                  onClick={() =>
                    setSizeQuantities((prev) => {
                      prev.push({ id: generateUUID(), size: '', quantity: '0' });
                      return [...prev];
                    })
                  }
                >
                  Add
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">Save</Button>
              </DialogClose>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
