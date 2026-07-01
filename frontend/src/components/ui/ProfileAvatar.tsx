import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

function isLikelyImageUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function getInitials(name: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  if (email) return email.charAt(0).toUpperCase()
  return "?"
}

export function ProfileAvatar({
  name,
  email,
  avatarUrl,
  size = "lg",
  className,
}: {
  name: string | null
  email?: string | null
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const [imgError, setImgError] = useState(false)
  const sizeClass = {
    sm: "h-9 w-9 text-sm",
    md: "h-12 w-12 text-base",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-3xl",
  }[size]

  const showImage = isLikelyImageUrl(avatarUrl ?? "") && !imgError

  useEffect(() => {
    setImgError(false)
  }, [avatarUrl])

  if (showImage) {
    return (
      <img
        src={avatarUrl!.trim()}
        alt=""
        onError={() => setImgError(true)}
        className={cn("shrink-0 rounded-full object-cover", sizeClass, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
        sizeClass,
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name, email)}
    </div>
  )
}
