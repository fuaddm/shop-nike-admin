import { useMemo, useRef, useState } from 'react';
import {
  COLOR_CODES,
  formatDate,
  formatMoney,
  type ProductApiResponse,
  type ProductApiVariation,
} from '~/routes/product';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Image as ImageIcon, Star, Upload, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { mainAPI } from '~/api/config';
import { UpdateVariationDialog } from './UpdateVariationDialog';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Stars({ value }: { value: number }) {
  const v = clamp(value ?? 0, 0, 5);
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
      <Star className="h-4 w-4" />
      <span>{v.toFixed(1)} / 5</span>
    </span>
  );
}

async function toggleVariationStatus(variationCode: string) {
  const token = sessionStorage.getItem('token');

  const resp = await mainAPI.patch<ProductApiResponse>(
    `/admin/product-variations/${encodeURIComponent(variationCode)}/toggle-status`,
    null,
    { headers: { token } }
  );

  if (resp.data?.result?.error) throw new Error(resp.data?.result?.errorMsg || 'Failed to toggle status');
  return resp.data;
}

/**
 * POST /admin/add-images
 * multipart/form-data:
 *  - productVariationId: string
 *  - images: File[]
 */
async function addVariationImages(productVariationId: string, files: File[]) {
  const token = sessionStorage.getItem('token');

  const form = new FormData();
  form.append('productVariationId', productVariationId);
  for (const file of files) form.append('images', file);

  const resp = await mainAPI.post<ProductApiResponse>('/admin/add-images', form, {
    headers: { token },
  });

  if (resp.data?.result?.error) throw new Error(resp.data?.result?.errorMsg || 'Failed to add images');
  return resp.data;
}

/**
 * DELETE /api/admin/delete-product-image
 * headers: token
 * query:
 *  - productVariationId: string
 *  - imageIdsToDelete: string[]
 */
async function deleteVariationImages(productVariationId: string, imageIds: string[]) {
  const token = sessionStorage.getItem('token');

  const params = new URLSearchParams();
  params.set('productVariationId', productVariationId);
  imageIds.forEach((id) => params.append('imageIdsToDelete', id));

  const resp = await mainAPI.delete<ProductApiResponse>(`/admin/delete-product-image?${params.toString()}`, {
    headers: { token },
  });

  if (resp.data?.result?.error) throw new Error(resp.data?.result?.errorMsg || 'Failed to delete images');
  return resp.data;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const val = bytes / Math.pow(1024, idx);
  return `${val.toFixed(val >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export function VariationCard({ v, onUpdated }: { v: ProductApiVariation; onUpdated?: () => void | Promise<void> }) {
  const [toggling, setToggling] = useState(false);

  // Upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Delete selection
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const activeImages = (v.images ?? []).filter((img) => img?.status && img?.url);
  const sizes = v.sizes ?? [];
  const totalQty = sizes.reduce((sum, s) => sum + (s.quantity ?? 0), 0);

  const colorLabel =
    v.colorName || COLOR_CODES.find((c) => c.id.toLowerCase() === (v.colorId || '').toLowerCase())?.name || '-';

  const selectedSummary = useMemo(() => {
    const total = selectedFiles.reduce((s, f) => s + (f.size ?? 0), 0);
    return { count: selectedFiles.length, totalBytes: total };
  }, [selectedFiles]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">
              <span className="font-mono">{v.variationCode}</span>
            </CardTitle>

            <CardDescription className="flex items-center gap-2">
              {v.status ? (
                <Badge className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Inactive
                </Badge>
              )}

              <span className="text-xs">Updated: {formatDate(v.updateDate)}</span>
            </CardDescription>
          </div>

          <div className="space-y-2 text-right">
            <div>
              <div className="text-lg font-semibold">{formatMoney(v.price)}</div>

              {v.promoDiscount ? (
                <div className="text-muted-foreground text-xs">
                  Promo: <span className="font-mono">{v.promoCodeId || '-'}</span> • {v.promoDiscount}% off
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">No promo</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-end gap-2">
              <UpdateVariationDialog
                variation={v}
                onUpdated={onUpdated}
              />

              <Button
                size="sm"
                variant={v.status ? 'destructive' : 'default'}
                disabled={toggling}
                onClick={async () => {
                  if (toggling) return;

                  setToggling(true);
                  try {
                    await toggleVariationStatus(v.variationCode);
                    await onUpdated?.();
                  } catch (e) {
                    alert(e instanceof Error ? e.message : 'Failed to toggle status');
                  } finally {
                    setToggling(false);
                  }
                }}
              >
                {toggling ? 'Updating…' : v.status ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">
            Color: {colorLabel}
            {v.colorId ? (
              <span
                className="ml-2 inline-block h-3 w-3 rounded-sm border align-middle"
                style={{ backgroundColor: v.colorId }}
                title={v.colorId}
              />
            ) : null}
          </Badge>

          {v.fabric ? <Badge variant="secondary">Fabric: {v.fabric}</Badge> : null}
          {v.make ? <Badge variant="secondary">Make: {v.make}</Badge> : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {v.description ? (
          <p className="text-muted-foreground line-clamp-3 text-sm">{v.description}</p>
        ) : (
          <p className="text-muted-foreground text-sm italic">No description</p>
        )}

        <Tabs
          defaultValue="images"
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="images">Images ({activeImages.length})</TabsTrigger>
            <TabsTrigger value="sizes">Sizes ({sizes.length})</TabsTrigger>
          </TabsList>

          {/* IMAGES TAB */}
          <TabsContent
            value="images"
            className="mt-3 space-y-3"
          >
            {/* Hidden input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setSelectedFiles(files);
                // allow picking same file again
                e.currentTarget.value = '';
              }}
            />

            {/* Upload controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
              <div className="text-sm">
                <div className="font-medium">Add images</div>
                <div className="text-muted-foreground text-xs">Select images to upload to this variation.</div>

                {selectedSummary.count ? (
                  <div className="text-muted-foreground mt-2 text-xs">
                    Selected: <span className="text-foreground">{selectedSummary.count}</span> •{' '}
                    <span className="text-foreground">{formatBytes(selectedSummary.totalBytes)}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose files
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={uploading || selectedFiles.length === 0}
                  onClick={() => setSelectedFiles([])}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>

                <Button
                  size="sm"
                  disabled={uploading || selectedFiles.length === 0}
                  onClick={async () => {
                    if (!selectedFiles.length || uploading) return;

                    setUploading(true);
                    try {
                      await addVariationImages(v.variationCode, selectedFiles); // ✅ uses VariationCode
                      setSelectedFiles([]);
                      await onUpdated?.();
                    } catch (e) {
                      alert(e instanceof Error ? e.message : 'Failed to upload images');
                    } finally {
                      setUploading(false);
                    }
                  }}
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </div>

            {/* Selected files list */}
            {selectedFiles.length ? (
              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Selected files</div>
                <div className="grid gap-2">
                  {selectedFiles.map((f) => (
                    <div
                      key={`${f.name}-${f.size}-${f.lastModified}`}
                      className="flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm">{f.name}</div>
                        <div className="text-muted-foreground text-xs">{formatBytes(f.size)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Images grid (click to select for delete) */}
            {activeImages.length ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {activeImages.slice(0, 12).map((img) => {
                    const selected = selectedImageIds.includes(img.imageId);

                    return (
                      <div
                        key={img.imageId}
                        className={`group bg-muted relative aspect-square cursor-pointer overflow-hidden rounded-md border ${
                          selected ? 'ring-2 ring-red-500' : ''
                        }`}
                        title={selected ? 'Selected for delete' : 'Click to select'}
                        onClick={() => {
                          setSelectedImageIds((prev) =>
                            prev.includes(img.imageId)
                              ? prev.filter((id) => id !== img.imageId)
                              : [...prev, img.imageId]
                          );
                        }}
                      >
                        <img
                          src={img.url}
                          alt={img.imageId}
                          className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                          loading="lazy"
                        />

                        {selected ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Trash2 className="h-6 w-6 text-white" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Delete actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                  <div className="text-sm">
                    <div className="font-medium">Delete images</div>
                    <div className="text-muted-foreground text-xs">
                      Click images to select. Selected:{' '}
                      <span className="text-foreground">{selectedImageIds.length}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={deleting || selectedImageIds.length === 0}
                      onClick={() => setSelectedImageIds([])}
                    >
                      Clear selection
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleting || selectedImageIds.length === 0}
                      onClick={async () => {
                        if (!selectedImageIds.length || deleting) return;

                        if (!confirm(`Delete ${selectedImageIds.length} image(s)?`)) return;

                        setDeleting(true);
                        try {
                          await deleteVariationImages(v.variationCode, selectedImageIds); // ✅ uses VariationCode
                          setSelectedImageIds([]);
                          await onUpdated?.();
                        } catch (e) {
                          alert(e instanceof Error ? e.message : 'Failed to delete images');
                        } finally {
                          setDeleting(false);
                        }
                      }}
                    >
                      {deleting ? 'Deleting…' : `Delete (${selectedImageIds.length})`}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground flex items-center gap-2 rounded-md border p-3 text-sm">
                <ImageIcon className="h-4 w-4" />
                No active images
              </div>
            )}
          </TabsContent>

          {/* SIZES TAB */}
          <TabsContent
            value="sizes"
            className="mt-3 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline">Total stock: {v.totalStock ?? 0}</Badge>
              <Badge variant="outline">Total qty (sum): {totalQty}</Badge>
            </div>

            {sizes.length ? (
              <div className="grid gap-2">
                {sizes.map((s) => (
                  <div
                    key={s.sizeId}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.sizeName}</span>
                      {s.sizeStatus ? (
                        <Badge variant="secondary">Available</Badge>
                      ) : (
                        <Badge variant="destructive">Disabled</Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Qty: <span className="text-foreground">{s.quantity ?? 0}</span>
                      <span className="ml-2 font-mono text-xs">inv#{s.inventoryId}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground rounded-md border p-3 text-sm">No sizes</div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div className="text-sm font-medium">Reviews</div>
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <Stars value={v.averageRating ?? 0} />
            <span>({v.reviewCount ?? 0})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
