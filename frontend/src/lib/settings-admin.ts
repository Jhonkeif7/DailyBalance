export const SETTINGS_ADMIN_EMAIL = "jhonkeifyd7@gmail.com"

export function isSettingsAdmin(email: string | undefined | null): boolean {
  return email?.toLowerCase() === SETTINGS_ADMIN_EMAIL.toLowerCase()
}
