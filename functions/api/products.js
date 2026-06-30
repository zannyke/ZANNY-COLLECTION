import { requireAdmin } from '../utils/auth.js';
import { broadcastNotification } from '../utils/fcm.js';

export async function onRequestGet(context) {
  try {
    // Self-healing migration to add is_deleted column if it does not exist
    try {
      await context.env.DB.prepare("ALTER TABLE products ADD COLUMN is_deleted INTEGER DEFAULT 0").run();
    } catch (e) {
      console.info("is_deleted column already exists or migration skipped:", e.message);
    }

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM products WHERE is_deleted = 0 ORDER BY created_at DESC"
    ).all();
    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const data = await context.request.json();
    const id = crypto.randomUUID();

    // Resolve image_url and gallery_urls
    let image_url = data.image || data.image_url || '';
    let gallery_urls = data.gallery_urls || [];
    if (!image_url && data.images && data.images.length > 0) {
      image_url = data.images[0];
      gallery_urls = data.images.slice(1);
    }
    const images = [image_url, ...(gallery_urls || [])].filter(Boolean);

    // Resolve variations
    let variations = [];
    if (data.variations) {
      if (typeof data.variations === 'string') {
        try { variations = JSON.parse(data.variations); } catch(e) { console.error("Failed to parse variations JSON:", e); }
      } else if (Array.isArray(data.variations)) {
        variations = data.variations;
      }
    }

    let colors = [];
    let sizes = [];
    const stock = Number(data.stock || 0);

    if (variations && variations.length > 0) {
      colors = Array.from(new Set(variations.map(v => v.color).filter(Boolean)));
      sizes = Array.from(new Set(variations.map(v => v.size).filter(Boolean)));
    } else {
      let rawColors = [];
      if (data.colors) {
        rawColors = Array.isArray(data.colors) ? data.colors : (typeof data.colors === 'string' ? JSON.parse(data.colors) : []);
      }
      let rawSizes = [];
      if (data.sizes) {
        rawSizes = Array.isArray(data.sizes) ? data.sizes : (typeof data.sizes === 'string' ? JSON.parse(data.sizes) : []);
      }
      colors = Array.from(new Set(rawColors.filter(Boolean)));
      sizes = Array.from(new Set(rawSizes.filter(Boolean)));

      const cLen = colors.length || 1;
      const sLen = sizes.length || 1;
      const totalCombinations = cLen * sLen;
      const baseQty = Math.floor(stock / totalCombinations);
      const remainder = stock % totalCombinations;

      let idx = 0;
      if (colors.length > 0 && sizes.length > 0) {
        for (const c of colors) {
          for (const s of sizes) {
            const qty = baseQty + (idx === totalCombinations - 1 ? remainder : 0);
            variations.push({ color: c, size: s, quantity: qty });
            idx++;
          }
        }
      } else if (colors.length > 0) {
        for (const c of colors) {
          const qty = baseQty + (idx === totalCombinations - 1 ? remainder : 0);
          variations.push({ color: c, size: '', quantity: qty });
          idx++;
        }
      } else if (sizes.length > 0) {
        for (const s of sizes) {
          const qty = baseQty + (idx === totalCombinations - 1 ? remainder : 0);
          variations.push({ color: '', size: s, quantity: qty });
          idx++;
        }
      } else {
        variations.push({ color: '', size: '', quantity: stock });
      }
    }

    const isPreorder = (data.is_preorder === true || data.is_preorder === 1 || data.isPreorder === true) ? 1 : 0;

    await context.env.DB.prepare(
      `INSERT INTO products (
        id, name, category, description, price, original_price, 
        discount_label, stock, sold, badge, image_url, 
        variations, gallery_urls, colors, sizes, images, is_preorder
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.name,
      data.category,
      data.description || '',
      Number(data.price),
      data.original_price ? Number(data.original_price) : null,
      data.discount_label || null,
      stock,
      data.badge || null,
      image_url,
      JSON.stringify(variations),
      JSON.stringify(gallery_urls),
      JSON.stringify(colors),
      JSON.stringify(sizes),
      JSON.stringify(images),
      isPreorder
    ).run();

    if (data.send_push === true || data.sendPush === true) {
      const title = `New Arrival: ${data.name}! 🚀`;
      const body = data.push_body || `Check out the new drop: ${data.name} is in stock now in ${data.category || 'New Arrivals'}. Tap to view!`;
      const route = `/product/${id}`;
      await broadcastNotification(context, title, body, route);
    }

    return Response.json({ success: true, id });
  } catch (err) {
    // Return the real error so the browser console shows what went wrong
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}


export async function onRequestPatch(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;
    const { id, stock } = await context.request.json();
    if (typeof stock !== 'number') {
      return Response.json({ error: 'Invalid stock value' }, { status: 400 });
    }
    await context.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(stock, id).run();
    return Response.json({ success: true });
  } catch(err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
