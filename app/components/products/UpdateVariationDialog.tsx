import { useEffect, useMemo, useState } from 'react';
import { mainAPI } from '~/api/config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Button } from '../ui/button';
import { COLOR_CODES, type ProductApiResponse, type ProductApiVariation } from '~/routes/product';
import { Separator } from '../ui/separator';
import { XCircle } from 'lucide-react';

type InventoryRow = { size: string; quantity: number };

async function updateProductVariation(payload: {
  variationCode: string;
  make: string;
  fabric: string;
  description: string;
  colorId: string;
  price: number;
  inventory: { size: string; quantity: number }[];
}) {
  const token = sessionStorage.getItem('token');

  // If your swagger is `/api/admin/update-product-variation` and mainAPI baseURL already includes `/api`,
  // keep this as `/admin/update-product-variation`.
  // If baseURL does NOT include `/api`, change to `/api/admin/update-product-variation`.
  const resp = await mainAPI.put<ProductApiResponse>(`/admin/update-product-variation`, payload, {
    headers: { token },
  });

  if (resp.data?.result?.error) throw new Error(resp.data?.result?.errorMsg || 'Failed to update variation');
  return resp.data;
}

export function UpdateVariationDialog({
  variation,
  onUpdated,
}: {
  variation: ProductApiVariation;
  onUpdated?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [make, setMake] = useState(variation.make ?? '');
  const [fabric, setFabric] = useState(variation.fabric ?? '');
  const [description, setDescription] = useState(variation.description ?? '');
  const [colorId, setColorId] = useState(variation.colorId ?? '');
  const [price, setPrice] = useState<number>(Number(variation.price ?? 0));

  const [rows, setRows] = useState<InventoryRow[]>(
    (variation.sizes ?? []).length
      ? (variation.sizes ?? []).map((s) => ({
          size: s.sizeName ?? '',
          quantity: Number(s.quantity ?? 0),
        }))
      : [{ size: '', quantity: 0 }]
  );

  useEffect(() => {
    if (!open) return;
    setMake(variation.make ?? '');
    setFabric(variation.fabric ?? '');
    setDescription(variation.description ?? '');
    setColorId(variation.colorId ?? '');
    setPrice(Number(variation.price ?? 0));
    setRows(
      (variation.sizes ?? []).length
        ? (variation.sizes ?? []).map((s) => ({
            size: s.sizeName ?? '',
            quantity: Number(s.quantity ?? 0),
          }))
        : [{ size: '', quantity: 0 }]
    );
    setError('');
  }, [open, variation]);

  const canSubmit = useMemo(() => {
    if (!variation.variationCode) return false;
    if (!colorId.trim()) return false;
    if (!Number.isFinite(price) || price < 0) return false;

    const valid = rows.filter((r) => r.size.trim());
    if (!valid.length) return false;
    if (valid.some((r) => !Number.isFinite(r.quantity) || r.quantity < 0)) return false;

    return true;
  }, [variation.variationCode, colorId, price, rows]);

  async function submit() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        variationCode: variation.variationCode,
        make: make.trim(),
        fabric: fabric.trim(),
        description: description.trim(),
        colorId: colorId.trim(),
        price: Number(price) || 0,
        inventory: rows
          .filter((r) => r.size.trim())
          .map((r) => ({ size: r.size.trim(), quantity: Number(r.quantity) || 0 })),
      };

      await updateProductVariation(payload);

      setOpen(false);
      await onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
        >
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Update variation</DialogTitle>
          <DialogDescription>
            Variation code: <span className="font-mono">{variation.variationCode}</span>
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not update variation</AlertTitle>
            <AlertDescription className="mt-2">{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Make</Label>
              <Input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Made in Turkey"
              />
            </div>

            <div className="space-y-2">
              <Label>Fabric</Label>
              <Input
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Cotton 100%"
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Color *</Label>
              <Select
                value={colorId}
                onValueChange={setColorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_CODES.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-3.5 w-3.5 rounded-sm border"
                          style={{ backgroundColor: c.id }}
                        />
                        <span>{c.name}</span>
                        <span className="text-muted-foreground font-mono text-xs">{c.id}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {colorId ? (
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span className="font-mono">{colorId}</span>
                  <span
                    className="h-3.5 w-3.5 rounded-sm border"
                    style={{ backgroundColor: colorId }}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Price *</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={Number.isFinite(price) ? price : 0}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
              className="min-h-[90px]"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Inventory *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRows((r) => [...r, { size: '', quantity: 0 }])}
              >
                Add row
              </Button>
            </div>

            <div className="grid gap-2">
              {rows.map((r, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2"
                >
                  <div className="col-span-7">
                    <Input
                      value={r.size}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, size: val } : x)));
                      }}
                      placeholder="Size (e.g. S, M, L, 38, 40)"
                    />
                  </div>

                  <div className="col-span-4">
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={Number.isFinite(r.quantity) ? r.quantity : 0}
                      onChange={(e) => {
                        const q = Number(e.target.value);
                        setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, quantity: q } : x)));
                      }}
                      placeholder="Qty"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}
                      disabled={rows.length <= 1}
                      title="Remove row"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground text-xs">
              At least one inventory row is required. Quantity must be 0+.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Updating…' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
