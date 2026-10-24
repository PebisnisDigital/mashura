export const MAX_UPLOAD = 3 * 1024 * 1024;
export function inspectUpload(
  name: string,
  bytes: Uint8Array,
  kind: "public" | "private",
): { mime: string; extension: string } {
  if (!bytes.length || bytes.length > MAX_UPLOAD)
    throw new Error("File kosong atau melebihi 3 MB.");
  const ext = name.split(".").pop()?.toLowerCase();
  const is = (a: number[]) => a.every((x, i) => bytes[i] === x);
  const text = new TextDecoder().decode(bytes.subarray(0, 16));
  if (kind === "public") {
    if (ext === "png" && is([137, 80, 78, 71, 13, 10, 26, 10]))
      return { mime: "image/png", extension: "png" };
    if (["jpg", "jpeg"].includes(ext ?? "") && is([255, 216, 255]))
      return { mime: "image/jpeg", extension: "jpg" };
    if (
      ext === "webp" &&
      text.startsWith("RIFF") &&
      text.slice(8, 12) === "WEBP"
    )
      return { mime: "image/webp", extension: "webp" };
    if (ext === "ico" && is([0, 0, 1, 0]))
      return { mime: "image/x-icon", extension: "ico" };
  } else {
    if (ext === "pdf" && text.startsWith("%PDF-"))
      return { mime: "application/pdf", extension: "pdf" };
    const zipped: Record<string, string> = {
      zip: "application/zip",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };
    if (ext && zipped[ext] && is([80, 75, 3, 4]))
      return { mime: zipped[ext], extension: ext };
    if (ext === "txt") {
      try {
        new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        if (!bytes.includes(0)) return { mime: "text/plain", extension: "txt" };
      } catch {}
    }
  }
  throw new Error(
    "Format atau signature file tidak sesuai. HTML/SVG dan file executable tidak diizinkan.",
  );
}
