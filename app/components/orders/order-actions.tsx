import type { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Form, Link } from 'react-router';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import type { MainCategory } from '~/routes/main-categories';

export function OrderActions({ row }: { row: Row<MainCategory> }) {
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
        <DropdownMenuItem asChild>
          <Link to={`/app/order/${row.original.orderId}`}>Details</Link>
        </DropdownMenuItem>
        {row.original.shippingStatus !== 3 && (
          <>
            <Dialog>
              <div>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Change status</DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Change status of "{row.original.orderId}"</DialogTitle>
                    <DialogDescription></DialogDescription>
                  </DialogHeader>
                  <Form
                    method="POST"
                    navigate={false}
                    className=""
                  >
                    <div className="mb-3 grid gap-4">
                      <Select
                        name="shippingStatus"
                        defaultValue={String(row.original.shippingStatus)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Status</SelectLabel>
                            <SelectItem value="0">Pending</SelectItem>
                            <SelectItem value="1">Shipped</SelectItem>
                            <SelectItem value="2">Delivered</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter className="flex items-center gap-3">
                      <input
                        type="hidden"
                        name="actionMethod"
                        value="update"
                      />
                      <input
                        type="hidden"
                        name="orderId"
                        value={row.original.orderId}
                      />
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="submit">Update</Button>
                      </DialogClose>
                    </DialogFooter>
                  </Form>
                </DialogContent>
              </div>
            </Dialog>
            <Dialog>
              <div>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    variant="destructive"
                  >
                    Cancel
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Remove "{row.original.orderId}"</DialogTitle>
                    <DialogDescription>Are you sure?</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4"></div>
                  <DialogFooter>
                    <Form
                      method="POST"
                      navigate={false}
                      className="flex items-center gap-3"
                    >
                      <input
                        type="hidden"
                        name="actionMethod"
                        value="cancel"
                      />
                      <input
                        type="hidden"
                        name="orderId"
                        value={row.original.orderId}
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
              </div>
            </Dialog>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
