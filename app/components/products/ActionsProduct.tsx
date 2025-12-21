import type { Row } from '@tanstack/react-table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Form, useFetcher } from 'react-router';
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type { Product } from '~/routes/products';

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

export function ActionsProduct({ row }: { row: Row<Product> }) {
  let fetcher = useFetcher({ key: 'get-info' });
  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities[]>([
    { id: generateUUID(), size: '', quantity: '0' },
  ]);
  const [variationCode, setVariationCode] = useState<string | null>(null);

  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (fetcher.data?.data?.data) {
      setDetails(fetcher.data?.data?.data);
      console.log(fetcher.data?.data?.data);
    }
  }, [fetcher]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Add variation</DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="max-h-screen overflow-y-scroll sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Add variation to "{row.getValue('name')}"</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <Form
              method="POST"
              navigate={false}
            >
              <input
                type="hidden"
                name="actionMethod"
                value="add-variation"
              />
              <input
                type="hidden"
                name="productId"
                value={row.original.id}
              />
              <input
                type="hidden"
                name="sizeQuantities"
                value={JSON.stringify(sizeQuantities)}
              />
              <div className="mb-4 grid gap-4">
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
            <DialogFooter></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          onOpenChange={(open) => {
            if (!open) {
              setDetails(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Open details</DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Details of "{row.getValue('name')}"</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            {fetcher.state !== 'loading' && details && (
              <Form
                method="POST"
                encType="multipart/form-data"
                className="flex flex-col gap-2"
              >
                <div>
                  <span className="font-semibold">Category: </span>
                  <span>{details.category.name}</span>
                </div>
                <div>
                  <span className="font-semibold">Color: </span>
                  <span>{details.color.name}</span>
                </div>
                <div>
                  <span className="font-semibold">Description: </span>
                  <span>{details.description}</span>
                </div>
                <div>
                  <span className="font-semibold">Gender: </span>
                  <span>{details.gender.name}</span>
                </div>
                <div>
                  <span className="font-semibold">Main category: </span>
                  <span>{details.mainCategory.name}</span>
                </div>
                <div>
                  <span className="font-semibold">Pricing: </span>
                  <span>{details.pricing.price}</span>
                </div>
                <div>
                  <span className="font-semibold">Images: </span>
                  <div className="mb-10 grid grid-cols-5 gap-3">
                    {details.images?.map((image: any) => {
                      return (
                        <div
                          key={image.url}
                          className="aspect-square w-full"
                        >
                          <img
                            className="h-full w-full object-cover"
                            src={image.url}
                            alt=""
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Button
                  type="button"
                  asChild
                >
                  <input
                    type="file"
                    name="images"
                    accept=".png, .jpg, .jpeg, .webp"
                    multiple
                  />
                </Button>
                <input
                  type="hidden"
                  name="actionMethod"
                  value="add-images"
                />
                <input
                  type="hidden"
                  name="productVariationId"
                  value={variationCode ?? ''}
                />
                <Button type="submit">Submit</Button>
              </Form>
            )}
            {fetcher.state === 'loading' && (
              <div
                role="status"
                className="grid h-[300px] place-content-center"
              >
                <svg
                  aria-hidden="true"
                  className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            )}
            {fetcher.state !== 'loading' && !details && (
              <div className="grid grid-cols-5 gap-5">
                {row.original.variations.map((variation) => {
                  return (
                    <div
                      key={variation.code}
                      onClick={() => {
                        setVariationCode(variation.code);
                        const formData = new FormData();
                        formData.append('actionMethod', 'get-info');
                        formData.append('variationCode', variation.code);

                        fetcher.submit(formData, { method: 'POST' });
                      }}
                      className="group relative aspect-square w-20 cursor-pointer overflow-hidden bg-gray-400"
                    >
                      <img
                        src={variation.image}
                        alt=""
                        className="absolute h-full w-full object-cover object-center"
                      />
                      <div className="absolute top-0 left-0 grid h-full w-full place-items-center bg-black/30 text-white opacity-0 transition group-hover:opacity-100">
                        Open
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <DialogFooter></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              variant="destructive"
            >
              Remove
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Remove "{row.getValue('name')}"</DialogTitle>
              <DialogDescription>Are you sure?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Form
                method="POST"
                navigate={false}
                className="flex items-center gap-3"
              >
                <input
                  type="hidden"
                  name="actionMethod"
                  value="remove"
                />
                <input
                  type="hidden"
                  name="id"
                  value={row.getValue('id')}
                />
                <DialogClose asChild>
                  <Button variant="outline">No</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit">Yes, I am sure</Button>
                </DialogClose>
              </Form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
