/**
 * aboutus controller
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

const normalizeEntity = (entry: any, baseUrl: string): any => {
  if (!entry) return null;
  const attr = entry.attributes ?? entry;
  const norm: any = { id: entry.id ?? null };

  for (const [key, val] of Object.entries(attr)) {
    // single media
    if (val && typeof val === 'object' && ((val as any)?.data?.attributes?.url || (val as any)?.url || (val as any)?.attributes?.url)) {
      norm[key] = pickMedia(val, baseUrl);
      continue;
    }

    // relation many (data array)
    if (val && typeof val === 'object' && Array.isArray((val as any).data)) {
      norm[key] = (val as any).data.map((item: any) => {
        const a = item.attributes ?? item;
        const simple: any = { id: item.id ?? null };
        for (const [fk, fv] of Object.entries(a)) {
          if (fv && typeof fv === 'object' && ((fv as any).data?.attributes?.url || (fv as any).url || (fv as any).attributes?.url)) {
            simple[fk] = pickMedia(fv, baseUrl);
          } else if (Array.isArray(fv)) {
            simple[fk] = fv.map((subItem) => 
              typeof subItem === 'object' ? normalizeEntity(subItem, baseUrl) : subItem
            );
          } else if (fv && typeof fv === 'object' && (fv as any).data) {
            simple[fk] = normalizeEntity((fv as any).data, baseUrl);
          } else {
            simple[fk] = fv;
          }
        }
        return simple;
      });
      continue;
    }

    // relation single
    if (val && typeof val === 'object' && (val as any).data && ((val as any).data.attributes || (val as any).data.url)) {
      const d = (val as any).data;
      const a = d.attributes ?? d;
      const simple: any = { id: d.id ?? null };
      for (const [fk, fv] of Object.entries(a)) {
        if (fv && typeof fv === 'object' && ((fv as any).data?.attributes?.url || (fv as any).url || (fv as any).attributes?.url)) {
          simple[fk] = pickMedia(fv, baseUrl);
        } else {
          simple[fk] = fv;
        }
      }
      norm[key] = simple;
      continue;
    }

    // array of components
    if (Array.isArray(val)) {
      norm[key] = val.map((item) => {
        if (!item || typeof item !== 'object') return item;
        const compNorm: any = {};
        for (const [ck, cv] of Object.entries(item)) {
          if (cv && typeof cv === 'object' && ((cv as any).data?.attributes?.url || (cv as any).url || (cv as any).attributes?.url)) {
            compNorm[ck] = pickMedia(cv, baseUrl);
          } else {
            compNorm[ck] = cv;
          }
        }
        return compNorm;
      });
      continue;
    }

    // single component
    if (val && typeof val === 'object') {
      const compNorm: any = {};
      for (const [ck, cv] of Object.entries(val)) {
        if (cv && typeof cv === 'object' && ((cv as any).data?.attributes?.url || (cv as any).url || (cv as any).attributes?.url)) {
          compNorm[ck] = pickMedia(cv, baseUrl);
        } else {
          compNorm[ck] = cv;
        }
      }
      norm[key] = compNorm;
      continue;
    }

    // primitive
    norm[key] = val;
  }

  return norm;
};

export default createCoreController('api::aboutus.aboutus', ({ strapi }) => ({
  async full(ctx) {
    try {
      // Build baseUrl for absolute media links
      const serverUrl = strapi.config.get('server.url', '');
      const reqHost = ctx.request ? `${ctx.request.protocol}://${ctx.request.get('host')}` : '';
      const baseUrl = serverUrl || reqHost || '';

      // Populate all relations and media deeply
      const populate: any = {
        founders: {
          populate: {
            avatar: true,
          }
        },
        Mission: {
          populate: {
            image: true,
          }
        },
        Vision: {
          populate: {
            image: true,
          }
        },
        about: {
          populate: {
            image: true,
          }
        },
        whyChoose: {
          populate: {
            icon: true,
          }
        },
      };

      // Fetch aboutus (single type)
      const entry = await strapi.documents('api::aboutus.aboutus').findFirst({ 
        populate,
        status: 'published'
      } as any);
      
      if (!entry) {
        return ctx.send({ data: null });
      }

      // Normalize the entry
      const normalized = normalizeEntity(entry, baseUrl);

      return ctx.send({ data: normalized });
    } catch (err) {
      strapi.log.error('aboutus.full error', err);
      return ctx.throw(500, err?.message || 'Internal Server Error');
    }
  },
}));
