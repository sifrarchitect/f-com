import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    await supabase.from('cms_content').select('id').limit(1)
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch {
    return Response.json(
      { status: 'error', database: 'disconnected' },
      { status: 503 }
    )
  }
}
