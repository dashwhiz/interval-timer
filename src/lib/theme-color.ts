export function setThemeColor(hex: string): void {
  if (typeof document === 'undefined') return
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(m => {
    m.setAttribute('content', hex)
  })
  document.documentElement.style.backgroundColor = hex
  document.body.style.backgroundColor = hex
}
