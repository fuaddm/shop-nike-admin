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

export function ActionsContent({ row }: { row: Row<any> }) {
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
          <Link to={`/app/edit-content/${row.getValue('name')}`}>Edit</Link>
        </DropdownMenuItem>
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
                <DialogTitle>Remove "{row.getValue('name')}" content</DialogTitle>
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
                    name="name"
                    value={row.getValue('name')}
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
