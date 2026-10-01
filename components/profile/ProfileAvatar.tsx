"use client"

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  )
}

/**
 * Circular portrait with a gradient ring and an initials fallback, so every
 * profile renders the same way whether or not a photo was uploaded.
 */
export function ProfileAvatar({
  photoUrl,
  name,
  className,
}: {
  photoUrl: string
  name: string
  className?: string
}) {
  return (
    <div
      className="rounded-full p-[3px]"
      style={{ background: "var(--dsc-gradient)" }}
    >
      <div
        className={`relative overflow-hidden rounded-full border-4 border-white bg-[#eef2f7] shadow-md ${className ?? ""}`}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              className="text-3xl font-bold md:text-4xl"
              style={{ color: "var(--dsc-navy)" }}
            >
              {initials(name)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}