import type { Route } from '.react-router/types/app/routes/+types/users';
import type { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';

import { mainAPI } from '~/api/config';
import { DataTable } from '~/components/data-table';
import { cn } from '~/lib/utils';

// shadcn/ui
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

// icons
import { MoreHorizontal } from 'lucide-react';

// RR
import { useFetcher, useNavigate, useSearchParams } from 'react-router';

// sonner
import { toast } from 'sonner';

type UserStatus = 'active' | 'removed' | string;

type UserRow = {
  id: string;
  userId: string;
  email: string;
  role: string;
  status: UserStatus;
};

type Intent = 'activate' | 'deactivate';

/** -----------------------------
 *  Columns factory
 *  ----------------------------- */
function buildColumns(opts: {
  onAskConfirm: (payload: { userId: string; action: Intent }) => void;
}): ColumnDef<UserRow>[] {
  const { onAskConfirm } = opts;

  return [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div>{row.original.userId}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <div>{row.original.role}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <div
            className={cn('w-fit rounded-full px-3.5 py-0.5 text-xs text-white', {
              'bg-green-500': status === 'active',
              'bg-red-500': status === 'removed',
              'bg-slate-500': status !== 'active' && status !== 'removed',
            })}
          >
            {status}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => {
        const u = row.original;
        const isActive = u.status === 'active';

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {isActive ? (
                  <DropdownMenuItem onClick={() => onAskConfirm({ userId: u.userId, action: 'deactivate' })}>
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onAskConfirm({ userId: u.userId, action: 'activate' })}>
                    Activate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

/** -----------------------------
 *  Loader
 *  ----------------------------- */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);

  try {
    const searchParams = new URLSearchParams({
      pageNumber: url.searchParams.get('pageNumber') || '1',
      pageSize: url.searchParams.get('pageSize') || '10',
      emailSearch: url.searchParams.get('q') || '',
      statusId: url.searchParams.get('statusId') || '',
    });

    const token = sessionStorage.getItem('token');

    const resp = await mainAPI.get(`/admin/users?${searchParams.toString()}`, {
      headers: { token },
    });

    if (resp.statusText === 'OK') {
      return { items: resp.data.data };
    }
  } catch {
    return { items: [] };
  }

  return { items: [] };
}

/** -----------------------------
 *  Action
 *  ----------------------------- */
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const intent = formData.get('intent');
  const userId = formData.get('userId');

  if (intent !== 'activate' && intent !== 'deactivate') {
    return { ok: false as const, error: 'Invalid intent' };
  }

  if (typeof userId !== 'string' || !userId) {
    return { ok: false as const, error: 'Missing userId' };
  }

  const token = sessionStorage.getItem('token');
  if (!token) {
    return { ok: false as const, error: 'Missing token' };
  }

  try {
    const endpoint = intent === 'activate' ? '/admin/activate-account' : '/admin/deactivate-account';

    await mainAPI.patch(endpoint, null, {
      params: { userId },
      headers: { token },
    });

    return { ok: true as const, intent, userId };
  } catch {
    return { ok: false as const, error: 'Request failed' };
  }
}

/** -----------------------------
 *  Component
 *  ----------------------------- */
export default function Users({ loaderData }: Route.ComponentProps) {
  const data = loaderData.items;

  const [rows, setRows] = React.useState<UserRow[]>(() => data?.items ?? []);
  const [totalRows, setTotalRows] = React.useState<number>(() => data?.totalCount ?? 0);

  React.useEffect(() => {
    setRows(data?.items ?? []);
    setTotalRows(data?.totalCount ?? 0);
  }, [data?.items, data?.totalCount]);

  const fetcher = useFetcher<typeof clientAction>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const statusId = searchParams.get('statusId') ?? '';

  function setQuery(next: Record<string, string>) {
    const sp = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (!v) sp.delete(k);
      else sp.set(k, v);
    });
    sp.set('pageNumber', '1');
    navigate(`?${sp.toString()}`, { replace: true });
  }

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pending, setPending] = React.useState<null | { userId: string; action: Intent }>(null);

  const columns = React.useMemo(
    () =>
      buildColumns({
        onAskConfirm: (p) => {
          setPending(p);
          setConfirmOpen(true);
        },
      }),
    []
  );

  React.useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;

    if (fetcher.data.ok) {
      const { intent, userId } = fetcher.data;

      setRows((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: intent === 'activate' ? 'active' : 'removed',
              }
            : u
        )
      );

      toast.success(intent === 'activate' ? 'User activated successfully' : 'User deactivated successfully');
    } else {
      toast.error(fetcher.data.error ?? 'Something went wrong');
    }
  }, [fetcher.state, fetcher.data]);

  const isSubmitting = fetcher.state !== 'idle';

  function onConfirm() {
    if (!pending) return;

    const fd = new FormData();
    fd.set('intent', pending.action);
    fd.set('userId', pending.userId);

    fetcher.submit(fd, { method: 'post' });

    setConfirmOpen(false);
    setPending(null);
  }

  return (
    <div className="px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-3xl font-semibold">Users</div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="w-[220px]">
          <Select
            value={statusId || 'all'}
            onValueChange={(v) => setQuery({ statusId: v === 'all' ? '' : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
              <SelectItem value="3">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        totalRows={totalRows}
        searchMode="server"
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.action === 'activate' ? 'Activate user?' : 'Deactivate user?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.action === 'activate'
                ? 'This will activate the selected account.'
                : 'This will deactivate the selected account.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving…' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
