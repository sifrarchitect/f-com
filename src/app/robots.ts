import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'fmanager.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/agency/', '/dashboard/'],
    },
    sitemap: `https://${domain}/sitemap.xml`,
  }
}
