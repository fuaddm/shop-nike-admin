import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { XCircle } from 'lucide-react';
import { mainAPI } from '~/api/config';
import { COLOR_CODES, type ProductApiResponse } from '~/routes/product';

type SizeQtyRow = { size: string; quantity: number };

export function AddVariationDialog({
  productId,
  onCreated,
}: {
  productId: string;
  onCreated?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [make, setMake] = useState('');
  const [fabric, setFabric] = useState('');
  const [description, setDescription] = useState('');
  const [colorId, setColorId] = useState('');
  const [price, setPrice] = useState<number>(0);

  const [rows, setRows] = useState<SizeQtyRow[]>([{ size: '', quantity: 0 }]);
  const [error, setError] = useState<string>('');

  const canSubmit = useMemo(() => {
    if (!productId) return false;
    if (!colorId.trim()) return false;
    if (!Number.isFinite(price) || price < 0) return false;

    const validRows = rows.filter((r) => r.size.trim());
    if (!validRows.length) return false;
    if (validRows.some((r) => !Number.isFinite(r.quantity) || r.quantity < 0)) return false;

    return true;
  }, [productId, colorId, price, rows]);

  function reset() {
    setMake('');
    setFabric('');
    setDescription('');
    setColorId('');
    setPrice(0);
    setRows([{ size: '', quantity: 0 }]);
    setError('');
  }

  async function submit() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');

      const payload = {
        productId,
        make: make.trim(),
        fabric: fabric.trim(),
        description: description.trim(),
        colorId: colorId.trim(),
        price: Number(price) || 0,
        sizeQuantities: rows
          .filter((r) => r.size.trim())
          .map((r) => ({
            size: r.size.trim(),
            quantity: Number(r.quantity) || 0,
          })),
      };

      // If your swagger is `/api/admin/add-product-variations` and mainAPI baseURL already includes `/api`,
      // keep this as `/admin/add-product-variations`.
      // If baseURL does NOT include `/api`, change to `/api/admin/add-product-variations`.
      const resp = await mainAPI.post<ProductApiResponse>(`/admin/add-product-variations`, payload, {
        headers: { token },
      });

      if (resp.data?.result?.error) {
        setError(resp.data?.result?.errorMsg || 'Failed to add variation');
        return;
      }

      setOpen(false);
      reset();
      await onCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Add variation</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Add product variation</DialogTitle>
          <DialogDescription>
            Product ID: <span className="font-mono">{productId}</span>
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not add variation</AlertTitle>
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
                placeholder="0"
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
              <Label>Sizes *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRows((r) => [...r, { size: '', quantity: 0 }])}
              >
                Add size row
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
              At least one size row is required. Quantity must be 0 or more.
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
            {submitting ? 'Adding…' : 'Add variation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
