import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
};

export async function GET(_: Request, { params }: { params: Promise<{ slug: string; file: string }> }) {
  const { slug, file } = await params;
  if (!/^[a-zA-Z0-9_-]+$/.test(slug) || file !== path.basename(file)) return new Response("Not found", { status: 404 });
  const p = path.join(process.cwd(), "paket", slug, "gambar", file);
  const type = TYPES[path.extname(p).toLowerCase()];
  if (!type || !fs.existsSync(p)) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(fs.readFileSync(p)), {
    headers: { "Content-Type": type, "Cache-Control": "no-cache" },
  });
}
