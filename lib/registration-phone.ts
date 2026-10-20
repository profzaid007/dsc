export function validRegistrationPhone(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value.replace(/[\s()\-]/g, ""))
}
