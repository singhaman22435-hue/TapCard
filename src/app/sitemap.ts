import { MetadataRoute } from 'next';
import { repo } from '@/lib/db/repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digitapcard-six.vercel.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const profiles = await repo.getAllProfiles();
    const publicProfileRoutes: MetadataRoute.Sitemap = profiles
      .filter((p) => p.is_public && p.status === 'ACTIVE')
      .map((p) => ({
        url: `${baseUrl}/c/${p.slug}`,
        lastModified: new Date(p.updated_at || p.created_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...publicProfileRoutes];
  } catch (err) {
    return staticRoutes;
  }
}
