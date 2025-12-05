/**
 * global controller
 */

import { factories } from '@strapi/strapi';

const { createCoreController } = factories;

const pickMedia = (raw: any, baseUrl: string): any => {
  if (!raw) return null;
  const m = raw.data?.attributes ?? raw.attributes ?? raw;
  if (!m) return null;

  const abs = (p: any) => {
    if (!p) return null;
    if (String(p).startsWith('http')) return p;
    return String(baseUrl || '').replace(/\/$/, '') + p;
  };

  return {
    url: abs(m.url),
    width: m.width ?? null,
    height: m.height ?? null,
  };
};

const normalizeComponent = (comp: any, baseUrl: string): any => {
  if (!comp || typeof comp !== 'object') return comp;
  
  if (Array.isArray(comp)) {
    return comp.map((item) => normalizeComponent(item, baseUrl));
  }

  const normalized: any = {};
  
  for (const [key, val] of Object.entries(comp)) {
    // Check if it's a media field
    if (val && typeof val === 'object' && ((val as any)?.data?.attributes?.url || (val as any)?.url || (val as any)?.attributes?.url)) {
      normalized[key] = pickMedia(val, baseUrl);
      continue;
    }

    // Check if it's an array of components
    if (Array.isArray(val)) {
      normalized[key] = val.map((item) => normalizeComponent(item, baseUrl));
      continue;
    }

    // Check if it's a nested component
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      normalized[key] = normalizeComponent(val, baseUrl);
      continue;
    }

    // Primitive value
    normalized[key] = val;
  }

  return normalized;
};

export default createCoreController('api::global.global', ({ strapi }) => ({
  async full(ctx) {
    try {
      // Build baseUrl for absolute media links
      const serverUrl = strapi.config.get('server.url', '');
      const reqHost = ctx.request ? `${ctx.request.protocol}://${ctx.request.get('host')}` : '';
      const baseUrl = serverUrl || reqHost || '';

      // Populate all relations and media deeply
      const populate: any = {
        headers: {
          populate: {
            logo: true,
            Search: true,
            Button: true,
            QuickMenu: true,
          }
        },
        footers: {
          populate: {
            companyInfo: true,
            services: true,
            about: true,
            address: true,
          }
        },
        theme: true,
        Socials: {
          populate: {
            logo: true,
          }
        },
      };

      // Fetch global (single type)
      const entry = await strapi.documents('api::global.global').findFirst({ 
        populate,
        status: 'published'
      } as any);
      
      if (!entry) {
        return ctx.send({ data: null });
      }

      // Normalize the entry
      const normalized = normalizeComponent(entry, baseUrl);

      return ctx.send({ data: normalized });
    } catch (err) {
      strapi.log.error('global.full error', err);
      return ctx.throw(500, err?.message || 'Internal Server Error');
    }
  },
}));
