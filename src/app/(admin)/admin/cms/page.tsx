import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { CmsContent } from '@/types/database'
import { FileEdit, Save } from 'lucide-react'
import CmsEditor from './CmsEditor'

async function getCmsContent() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cms_content')
    .select('*')
    .order('key', { ascending: true })
  return (data || []) as CmsContent[]
}

// Group CMS keys by section
function groupContent(items: CmsContent[]) {
  const groups: Record<string, CmsContent[]> = {
    homepage: [],
    legal: [],
    other: [],
  }

  for (const item of items) {
    if (item.key.startsWith('hero_') || item.key.startsWith('social_') || item.key.startsWith('feature_') || item.key.startsWith('cta_') || item.key.startsWith('pricing_')) {
      groups.homepage.push(item)
    } else if (item.key.startsWith('privacy_') || item.key.startsWith('terms_')) {
      groups.legal.push(item)
    } else {
      groups.other.push(item)
    }
  }

  return groups
}

export default async function CmsPage() {
  const content = await getCmsContent()
  const groups = groupContent(content)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Edit homepage and legal page content</p>
      </div>

      <CmsEditor content={content} />

      {content.length === 0 && (
        <div className="fm-card p-16 text-center">
          <FileEdit className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No CMS content found</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Run the database migrations to seed initial CMS content
          </p>
        </div>
      )}
    </div>
  )
}
