import { mainAPI } from '~/api/config';
import type { Route } from './+types/order';
import { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { ScrollArea } from '~/components/ui/scroll-area';

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const token = sessionStorage.getItem('token');
  const resp = await mainAPI.get(`/admin/orders/${params.orderId}`, {
    headers: { token },
  });
  return resp.data.data;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    Shipped: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
    Delivered: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    Cancelled: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
  };

  return (
    <Badge
      variant="outline"
      className={cn('rounded-full border px-3 py-1 text-xs font-medium', styles[status] ?? 'text-muted-foreground')}
    >
      {status}
    </Badge>
  );
}

function AccountBadge({ status }: { status?: string }) {
  const s = (status ?? '').toLowerCase();
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    inactive: 'bg-muted text-muted-foreground border-border',
    blocked: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
    banned: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs font-medium',
        styles[s] ?? 'bg-muted text-muted-foreground border-border'
      )}
    >
      {status ?? 'unknown'}
    </Badge>
  );
}

function formatMoney(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

export default function Order({ loaderData }: Route.ComponentProps) {
  const order = loaderData;
  const [orderDate, setOrderDate] = useState('');

  useEffect(() => {
    setOrderDate(new Date(order.orderDate + 'Z').toLocaleString());
  }, [order.orderDate]);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">Order</div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">#{order.orderId}</h1>

          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            <span>Placed: {orderDate}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              Items: <span className="text-foreground font-medium">{order.itemsCount}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              Qty: <span className="text-foreground font-medium">{order.totalQuantity}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.statusName} />
          <div className="bg-card rounded-lg border px-4 py-2 text-right">
            <div className="text-muted-foreground text-xs">Total</div>
            <div className="text-lg font-semibold">{formatMoney(order.totalAmount)}</div>
          </div>
        </div>
      </div>

      {/* Top cards: Summary + Shipping + User */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Totals & discounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatMoney(order.subTotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium">{formatMoney(order.discount)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-emerald-600">FREE</span>
            </div>

            <Separator />

            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
            <CardDescription>Delivery address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="font-medium">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </div>

            <div className="text-muted-foreground">{order.shippingAddress.streetAddress}</div>

            <div className="text-muted-foreground">
              {order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.zipCode}
            </div>

            <div className="text-muted-foreground">{order.shippingAddress.phoneNumber}</div>

            {order.trackingNumber ? (
              <div className="bg-muted/30 rounded-md border p-3 text-sm">
                Tracking Number: <span className="font-medium">{order.trackingNumber}</span>
              </div>
            ) : (
              <div className="bg-muted/30 text-muted-foreground rounded-md border p-3 text-sm">
                No tracking number yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>User</CardTitle>
            <CardDescription>Customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Name</div>
              <div className="font-medium">
                {order.userInfo?.firstName ?? '—'} {order.userInfo?.lastName ?? ''}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Email</div>
              <div className="font-medium break-all">{order.userInfo?.email ?? '—'}</div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">Account status</div>
              <AccountBadge status={order.userInfo?.accountStatus} />
            </div>

            <div className="bg-muted/30 rounded-xl border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-medium">{order.userId}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Shipping status</span>
                <span className="font-medium">{order.shippingStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>
            {order.itemsCount} products • {order.totalQuantity} total qty
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[520px] pr-3">
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div
                  key={item.productId}
                  className="bg-card hover:bg-muted/40 flex flex-col gap-4 rounded-xl border p-4 transition sm:flex-row"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="h-28 w-full rounded-lg object-cover sm:h-24 sm:w-24"
                  />

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="leading-tight font-medium">{item.productName}</div>

                        {item.isDiscountApplied ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">Discount</Badge>
                        ) : null}
                      </div>

                      <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">{item.colorName}</Badge>
                        <Badge variant="secondary">Size {item.sizeName}</Badge>
                        <Badge variant="outline">SKU {item.productId}</Badge>
                        <Badge variant="outline">Base {item.baseProductId}</Badge>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div className="text-muted-foreground text-sm">
                        Qty: <span className="text-foreground font-medium">{item.quantity}</span>
                      </div>

                      <div className="text-right">
                        {item.discountedPrice ? (
                          <>
                            <div className="text-muted-foreground text-sm line-through">{formatMoney(item.price)}</div>
                            <div className="font-semibold text-emerald-600">{formatMoney(item.discountedPrice)}</div>
                            <div className="text-muted-foreground text-xs">
                              You save {formatMoney(item.discountAmount)}
                            </div>
                          </>
                        ) : (
                          <div className="font-semibold">{formatMoney(item.price)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
