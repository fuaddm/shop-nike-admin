// components/products/ActionsProduct.tsx

import type { Row } from '@tanstack/react-table';
import { MoreHorizontal, PackageOpen, Pencil, Power } from 'lucide-react';
import { Link, useFetcher } from 'react-router';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { Product } from '~/routes/products';

export function ActionsProduct({ row }: { row: Row<Product> }) {
  const fetcher = useFetcher();

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
          <Link
            to={`/app/edit-product/${row.original.id}`}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to={`/app/product/${row.original.id}`}
            className="flex items-center gap-2"
          >
            <PackageOpen className="h-4 w-4" />
            Open Details
          </Link>
        </DropdownMenuItem>

        {/* NEW: Toggle Status */}
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="p-0"
        >
          <fetcher.Form
            method="post"
            className="w-full"
          >
            <input
              type="hidden"
              name="actionMethod"
              value="toggle-status"
            />
            <input
              type="hidden"
              name="productId"
              value={row.original.id}
            />

            <button
              type="submit"
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
              disabled={fetcher.state !== 'idle'}
            >
              <Power className="h-4 w-4" />
              Toggle Status
            </button>
          </fetcher.Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
