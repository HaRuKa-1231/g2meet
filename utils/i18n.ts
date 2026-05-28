export function t(key: string, vars?: Record<string, string | number>): string {
  let s = chrome.i18n.getMessage(key, vars ? Object.values(vars).map(String) : undefined);
  if (!s) return key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}

export function getLang(): string {
  return chrome.i18n.getUILanguage();
}
