import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { CheckCircle2, XCircle, Package, ArrowLeft } from 'lucide-react';
import { mainAPI } from '~/api/config';
import type { Route } from './+types/product';
import { useNavigate } from 'react-router';
import { VariationCard } from '~/components/products/VariationCard';
import { ProductSkeleton } from '~/components/products/ProductSkeleton';
import { AddVariationDialog } from '~/components/products/AddVariationDialog';

export const COLOR_CODES = [
  { id: '#000000', name: 'Black' },
  { id: '#000080', name: 'Navy' },
  { id: '#0000ff', name: 'Blue' },
  { id: '#008000', name: 'Dark Green' },
  { id: '#008080', name: 'Teal' },
  { id: '#00ff00', name: 'Green' },
  { id: '#00ffff', name: 'Cyan' },
  { id: '#08a4a7', name: 'Teal' },
  { id: '#131c31', name: 'Dark Midnight Blue' },
  { id: '#416aa3', name: 'Steel Blue' },
  { id: '#6c6377', name: 'Dark Purple' },
  { id: '#800000', name: 'Maroon' },
  { id: '#800080', name: 'Purple' },
  { id: '#808000', name: 'Olive' },
  { id: '#808080', name: 'Gray' },
  { id: '#8a2be2', name: 'Blue Violet' },
  { id: '#a52a2a', name: 'Brown' },
  { id: '#b3b7bf', name: 'Light Slate Gray' },
  { id: '#f67c41', name: 'Orange Red' },
  { id: '#fbe9d2', name: 'Peach Puff' },
  { id: '#ff0000', name: 'Red' },
  { id: '#ff00ff', name: 'Magenta' },
  { id: '#ff4500', name: 'Orange Red' },
  { id: '#FFA07A', name: 'Light Salmon' },
  { id: '#ffbe98', name: 'Light Coral' },
  { id: '#ffff00', name: 'Yellow' },
  { id: '#ffffff', name: 'White' },
];

// ---------- Types ----------
export type ProductApiResult = {
  status: boolean;
  code: number;
  time: number;
  error: boolean;
  errorMsg: string;
};

export type ProductApiImage = {
  imageId: string;
  url: string;
  status: boolean;
};

export type ProductApiSize = {
  sizeId: number;
  sizeName: string;
  sizeStatus: boolean;
  quantity: number;
  inventoryId: number;
};

export type ProductApiVariation = {
  variationCode: string;
  status: boolean;
  updateDate: string;
  make: string;
  fabric: string;
  description: string;
  colorId: string;
  colorName: string;
  price: number;
  promoCodeId: string;
  promoDiscount: number;
  images: ProductApiImage[];
  sizes: ProductApiSize[];
  totalStock: number;
  reviewCount: number;
  averageRating: number;
};

export type ProductApiData = {
  productId: string;
  productName: string;
  mainCategoryId: number;
  mainCategoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  genderId: number;
  genderName: string;
  productStatus: boolean;
  productUpdateDate: string;
  totalVariations: number;
  variations: ProductApiVariation[];
};

export type ProductApiResponse = {
  result: ProductApiResult;
  data: ProductApiData;
};

// ---------- Helpers ----------
export function formatDate(iso: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function formatMoney(value: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value ?? 0);
  } catch {
    return `${value ?? 0}`;
  }
}

// ---------- API ----------
async function fetchProductVariations(productId: string) {
  const token = sessionStorage.getItem('token');

  const resp = await mainAPI.get<ProductApiResponse>(`/admin/products/${encodeURIComponent(productId)}/variations`, {
    headers: { token },
  });

  if (resp.data?.result?.error) throw new Error(resp.data?.result?.errorMsg || 'Failed to load');
  return resp.data.data;
}

// ---------- Loader ----------
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const productId = params.productId;

  try {
    const token = sessionStorage.getItem('token');

    try {
      const resp = await mainAPI.get<ProductApiResponse>(
        `/admin/products/${encodeURIComponent(productId)}/variations`,
        {
          headers: { token },
        }
      );

      if (resp.data?.result?.error) return null;

      return resp.data.data;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

// ---------- Page ----------
export default function Product({ loaderData }: Route.ComponentProps) {
  const initial = loaderData as ProductApiData | null | undefined;

  const navigate = useNavigate();

  const [p, setP] = useState<ProductApiData | null | undefined>(initial);
  useEffect(() => setP(initial), [initial]);

  if (p === undefined) return <ProductSkeleton />;
  if (p === null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Alert variant="destructive">
          <AlertTitle>Could not load product</AlertTitle>
          <AlertDescription className="mt-2">Please check ProductId or try again.</AlertDescription>
        </Alert>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      {/* Header */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{p.productName}</h1>
            <p className="text-muted-foreground text-sm">
              Product ID: <span className="font-mono">{p.productId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {p.productStatus ? (
              <Badge className="gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Active
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                Inactive
              </Badge>
            )}

            <Badge
              variant="secondary"
              className="gap-1"
            >
              <Package className="h-4 w-4" />
              {p.totalVariations} variations
            </Badge>

            <AddVariationDialog
              productId={p.productId}
              onCreated={async () => {
                try {
                  const fresh = await fetchProductVariations(p.productId);
                  setP(fresh);
                } catch {
                  // optional fallback
                }
              }}
            />
          </div>
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-2 text-sm">
          <span>
            Main: <span className="text-foreground">{p.mainCategoryName}</span>
          </span>
          <span>•</span>
          <span>
            Sub: <span className="text-foreground">{p.subCategoryName}</span>
          </span>
          <span>•</span>
          <span>
            Category: <span className="text-foreground">{p.categoryName}</span>
          </span>
          <span>•</span>
          <span>
            Gender: <span className="text-foreground">{p.genderName}</span>
          </span>
          <span className="ml-auto">
            Updated: <span className="text-foreground">{formatDate(p.productUpdateDate)}</span>
          </span>
        </div>
      </div>

      <Separator />

      {/* Variations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Variations</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top
          </Button>
        </div>

        {p.variations?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {p.variations.map((v) => (
              <VariationCard
                key={v.variationCode}
                v={v}
                onUpdated={async () => {
                  const fresh = await fetchProductVariations(p.productId);
                  setP(fresh);
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              No variations found for this product.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message =
    error instanceof Response
      ? `${error.status} ${error.statusText}`
      : error instanceof Error
        ? error.message
        : 'Unknown error';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">{message}</AlertDescription>
      </Alert>
    </div>
  );
}
