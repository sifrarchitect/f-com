'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { X, Plus, GripVertical, Upload, Loader2, ImageIcon } from 'lucide-react'
import type { Product, VariantType, VariantOption } from '@/types/database'
import { v4 as uuidv4 } from 'uuid'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

interface ProductFormProps {
  product?: Product
  shopId: string
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
}

export default function ProductForm({ product, shopId }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [isSimple, setIsSimple] = useState(!product?.has_variants)
  const [variants, setVariants] = useState<VariantType[]>(
    product?.variants
      ? Array.isArray(product.variants)
        ? (product.variants as unknown as VariantType[])
        : (JSON.parse(product.variants as string) as unknown as VariantType[])
      : []
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Image Upload ─────────────────────────────────────────────────
  const handleImageUpload = useCallback(async (files: FileList) => {
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }
    setUploadingImages(true)
    const supabase = createClient()
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      try {
        const compressed = await imageCompression(file, COMPRESSION_OPTIONS)
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `products/${shopId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data, error: upError } = await supabase.storage
          .from('product-images')
          .upload(path, compressed, { upsert: false })
        if (upError) { setError(upError.message); continue }
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path)
        uploaded.push(urlData.publicUrl)
      } catch (err) {
        setError('Image upload failed. Try again.')
      }
    }
    setImages(prev => [...prev, ...uploaded])
    setUploadingImages(false)
  }, [images.length, shopId])

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx))

  // ── Variant helpers ──────────────────────────────────────────────
  const addVariant = () => {
    setVariants(prev => [...prev, {
      id: uuidv4(),
      type: '',
      options: [{ value: '', stock: 0, price_modifier: 0 }],
    }])
  }

  const removeVariant = (id: string) => setVariants(prev => prev.filter(v => v.id !== id))

  const updateVariantType = (id: string, type: string) =>
    setVariants(prev => prev.map(v => v.id === id ? { ...v, type } : v))

  const addOption = (variantId: string) =>
    setVariants(prev => prev.map(v => v.id === variantId
      ? { ...v, options: [...v.options, { value: '', stock: 0, price_modifier: 0 }] }
      : v
    ))

  const removeOption = (variantId: string, idx: number) =>
    setVariants(prev => prev.map(v => v.id === variantId
      ? { ...v, options: v.options.filter((_, i) => i !== idx) }
      : v
    ))

  const updateOption = (variantId: string, idx: number, field: keyof VariantOption, value: string | number) =>
    setVariants(prev => prev.map(v => v.id === variantId
      ? {
        ...v, options: v.options.map((o, i) => i === idx ? { ...o, [field]: typeof value === 'string' && field !== 'value' ? parseInt(value, 10) || 0 : value } : o),
      }
      : v
    ))

  // ── Submit ───────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    fd.set('images', JSON.stringify(images))
    fd.set('variants', isSimple ? '[]' : JSON.stringify(variants))
    fd.set('is_active', 'true')

    // Auto-generate slug from name if empty
    const name = fd.get('name') as string
    const slug = (fd.get('slug') as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
    fd.set('slug', slug)

    const result = product
      ? await updateProduct(product.id, fd)
      : await createProduct(fd)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-start gap-2">
          <X className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Basic Information</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Product Name *</label>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. Premium T-Shirt"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">URL Slug</label>
          <input
            name="slug"
            defaultValue={product?.slug}
            className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="auto-generated from name"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            name="description"
            defaultValue={product?.description || ''}
            rows={4}
            className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Describe your product…"
          />
        </div>
      </div>

      {/* Images */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Images <span className="text-muted-foreground font-normal">(max 5)</span></h2>
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg border border-border overflow-hidden group">
              <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              {i === 0 && <span className="absolute top-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">Main</span>}
            </div>
          ))}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImages}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-foreground/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {uploadingImages ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <span className="text-xs">Upload</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleImageUpload(e.target.files)}
        />
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — auto-compressed to 1MB</p>
      </div>

      {/* Pricing & Stock */}
      <div className="fm-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Pricing &amp; Stock</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSimple(true)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${isSimple ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent'}`}
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => setIsSimple(false)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${!isSimple ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent'}`}
            >
              With Variants
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Base Price (BDT) *</label>
            <input
              type="number"
              name="base_price"
              required
              min={1}
              defaultValue={product?.base_price}
              className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>
          {isSimple && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Stock *</label>
              <input
                type="number"
                name="simple_stock"
                required
                min={0}
                defaultValue={product?.simple_stock}
                className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0"
              />
            </div>
          )}
        </div>

        {/* Variant builder */}
        {!isSimple && (
          <div className="space-y-4">
            {variants.map((variant, vi) => (
              <div key={variant.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    value={variant.type}
                    onChange={e => updateVariantType(variant.id, e.target.value)}
                    placeholder="Variant type (e.g. Size, Color)"
                    className="flex-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button type="button" onClick={() => removeVariant(variant.id)} className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors">
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                </div>
                <div className="space-y-2">
                  {variant.options.map((opt, oi) => (
                    <div key={oi} className="grid grid-cols-[1fr,90px,90px,32px] gap-2 items-center">
                      <input
                        value={opt.value}
                        onChange={e => updateOption(variant.id, oi, 'value', e.target.value)}
                        placeholder="Option value (e.g. M, Red)"
                        className="h-9 px-3 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="number"
                        value={opt.stock}
                        onChange={e => updateOption(variant.id, oi, 'stock', e.target.value)}
                        placeholder="Stock"
                        min={0}
                        className="h-9 px-2 rounded-md bg-background border border-border text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="number"
                        value={opt.price_modifier}
                        onChange={e => updateOption(variant.id, oi, 'price_modifier', e.target.value)}
                        placeholder="±BDT"
                        className="h-9 px-2 rounded-md bg-background border border-border text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button type="button" onClick={() => removeOption(variant.id, oi)} disabled={variant.options.length === 1}
                        className="h-9 w-9 flex items-center justify-center hover:bg-destructive/10 rounded-md disabled:opacity-30 transition-colors">
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(variant.id)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Add option
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addVariant}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg px-4 py-3 w-full justify-center hover:border-foreground/40 transition-colors">
              <Plus className="h-4 w-4" /> Add Variant Type
            </button>
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">SEO <span className="text-muted-foreground font-normal">(optional)</span></h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground">SEO Title</label>
          <input
            name="seo_title"
            defaultValue={product?.seo_title || ''}
            className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">SEO Description</label>
          <textarea
            name="seo_description"
            defaultValue={product?.seo_description || ''}
            rows={2}
            className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || uploadingImages}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {product ? 'Save Changes' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
