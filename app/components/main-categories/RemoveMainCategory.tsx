import type { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Form } from 'react-router';
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
import type { MainCategory } from '~/routes/main-categories';

export function RemoveMainCategory({ row }: { row: Row<MainCategory> }) {
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
          <div>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Update</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update "{row.getValue('name')}" main category</DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <Form
                method="POST"
                navigate={false}
                className=""
              >
                <div className="mb-3 grid gap-4">
                  <Input
                    placeholder="New Name"
                    name="name"
                  />
                </div>
                <DialogFooter className="flex items-center gap-3">
                  <input
                    type="hidden"
                    name="actionMethod"
                    value="update"
                  />
                  <input
                    type="hidden"
                    name="id"
                    value={row.getValue('id')}
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
                Remove
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Remove "{row.getValue('name')}" main category</DialogTitle>
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
          </div>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
