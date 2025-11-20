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
import type { HierarchySubCategory } from '~/routes/hierarchy-categories';

export function ActionsHierarchySubCategory({ row }: { row: Row<HierarchySubCategory> }) {
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
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              variant="destructive"
            >
              Remove
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Remove "{row.getValue('name')}" sub category</DialogTitle>
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
                  name="hierarchy_id"
                  value={row.getValue('hierarchy_id')}
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
