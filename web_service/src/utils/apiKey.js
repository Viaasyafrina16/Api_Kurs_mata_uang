import { nanoid } from "nanoid";

export function generateApiKey() {
  // format key mirip layanan API umum
  const prefix = "sk_live_";
  const raw = prefix + nanoid(32); // contoh: sk_live_xxxxxxxxx
  return { raw, prefix };
}
