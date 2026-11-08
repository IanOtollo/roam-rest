import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { getPropertyBySlug } from "@/lib/store";

const W = 1200;
const H = 630;

async function load(src: string): Promise<Buffer | null> {
  try {
    if (src.startsWith("/")) return await readFile(path.join(process.cwd(), "public", src));
    const res = await fetch(src);
    return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

/**
 * Link-preview card for a stay (WhatsApp, Facebook, X ...): the cover photo with a soft shade at
 * the bottom and the Roam & Rest logo sitting at the bottom left.
 */
export async function renderStayOg(slug: string): Promise<Response> {
  const property = await getPropertyBySlug(slug);
  const [photo, logo] = await Promise.all([
    property ? load(property.cover) : null,
    load("/brand/logo-mark-dark.png"),
  ]);

  const base = photo
    ? sharp(photo).resize(W, H, { fit: "cover", position: "centre" })
    : sharp({ create: { width: W, height: H, channels: 3, background: "#1b1612" } });

  const shade = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.7"/><stop offset="0.45" stop-color="#000" stop-opacity="0.2"/><stop offset="0.7" stop-color="#000" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`,
  );
  const layers: OverlayOptions[] = [{ input: shade, top: 0, left: 0 }];

  if (logo) {
    const { data, info } = await sharp(logo).resize({ width: 230 }).png().toBuffer({ resolveWithObject: true });
    layers.push({ input: data, left: 48, top: H - info.height - 40 });
  }

  const out = await base.composite(layers).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(out), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
