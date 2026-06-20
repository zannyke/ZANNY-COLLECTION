import { requireAdmin } from '../../utils/auth.js';

export async function onRequestDelete(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const id = context.params.id;

    // 1. Get the product to find the image_url
    const product = await context.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
    
    if (!product) {
      return new Response('Not found', { status: 404 });
    }

    // 2. Delete the image from R2 if it exists
    if (product.image_url) {
      const keyMatch = product.image_url.match(/\/api\/images\/(.+)$/);
      if (keyMatch && keyMatch[1]) {
        await context.env.BUCKET.delete(keyMatch[1]);
      }
    }

    // 3. Perform a soft-delete on the product in the D1 Database
    // (This retains the row for historical orders, but sets is_deleted = 1, sets stock to 0, and clears the image reference)
    await context.env.DB.prepare(
      "UPDATE products SET is_deleted = 1, image_url = NULL, stock = 0 WHERE id = ?"
    ).bind(id).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPut(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;
    const id = context.params.id;
    const data = await context.request.json();

    // Resolve images
    let resolved_image_url = data.image_url || data.image || '';
    let resolved_gallery_urls = data.gallery_urls || [];
    if (!resolved_image_url && data.images && data.images.length > 0) {
      resolved_image_url = data.images[0];
      resolved_gallery_urls = data.images.slice(1);
    }
    const images = [resolved_image_url, ...(resolved_gallery_urls || [])].filter(Boolean);

    // Resolve variations
    let parsedVariations = [];
    if (data.variations) {
      if (typeof data.variations === 'string') {
        try { parsedVariations = JSON.parse(data.variations); } catch(e) { console.error("Failed to parse variations JSON:", e); }
      } else if (Array.isArray(data.variations)) {
        parsedVariations = data.variations;
      }
    }

    let colors = [];
    let sizes = [];
    const stock = Number(data.stock || 0);

    if (parsedVariations && parsedVariations.length > 0) {
      colors = Array.from(new Set(parsedVariations.map(v => v.color).filter(Boolean)));
      sizes = Array.from(new Set(parsedVariations.map(v => v.size).filter(Boolean)));
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
            parsedVariations.push({ color: c, size: s, quantity: qty });
            idx++;
          }
        }
      } else if (colors.length > 0) {
        for (const c of colors) {
          const qty = baseQty + (idx === totalCombinations - 1 ? remainder : 0);
          parsedVariations.push({ color: c, size: '', quantity: qty });
          idx++;
        }
      } else if (sizes.length > 0) {
        for (const s of sizes) {
          const qty = baseQty + (idx === totalCombinations - 1 ? remainder : 0);
          parsedVariations.push({ color: '', size: s, quantity: qty });
          idx++;
        }
      } else {
        parsedVariations.push({ color: '', size: '', quantity: stock });
      }
    }

    await context.env.DB.prepare(`
      UPDATE products 
      SET name = ?, category = ?, description = ?, price = ?, original_price = ?, discount_label = ?, stock = ?, badge = ?, image_url = ?, variations = ?, gallery_urls = ?, colors = ?, sizes = ?, images = ?
      WHERE id = ?
    `).bind(
      data.name, data.category, data.description || '', 
      data.price || 0, 
      data.original_price || null, 
      data.discount_label || null, 
      stock, 
      data.badge || null, 
      resolved_image_url || null, 
      JSON.stringify(parsedVariations),
      JSON.stringify(resolved_gallery_urls),
      JSON.stringify(colors),
      JSON.stringify(sizes),
      JSON.stringify(images),
      id
    ).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
