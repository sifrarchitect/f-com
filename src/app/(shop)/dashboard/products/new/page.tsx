import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewProductPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <Link href="/dashboard/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a new product for your store</p>
      </div>

      <form className="space-y-6">
        {/* Basic Info */}
        <div className="fm-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Basic Information</h2>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Product Name *</label>
            <input type="text" name="name" required className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Premium T-Shirt" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea name="description" rows={4} className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y" placeholder="Describe your product..." />
          </div>
        </div>

        {/* Pricing */}
        <div className="fm-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Pricing & Stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Price (BDT) *</label>
              <input type="number" name="base_price" required min={0} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Stock *</label>
              <input type="number" name="simple_stock" required min={0} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="fm-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Images</h2>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground">Drag & drop images or click to upload</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Max 5 images, 2MB each. Auto-compressed.</p>
          </div>
        </div>

        {/* SEO */}
        <div className="fm-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">SEO (Optional)</h2>
          <div>
            <label className="text-xs font-medium text-muted-foreground">SEO Title</label>
            <input type="text" name="seo_title" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">SEO Description</label>
            <textarea name="seo_description" rows={2} className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
            Create Product
          </button>
          <Link href="/dashboard/products" className="px-6 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
