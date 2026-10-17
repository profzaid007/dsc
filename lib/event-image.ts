export function validateEventImage(file: {type: string; size: number}): "type" | "size" | null {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return "type"
  return file.size > 5 * 1024 * 1024 ? "size" : null
}
