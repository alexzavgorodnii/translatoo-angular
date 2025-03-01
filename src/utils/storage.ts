export enum StorageKeys {
  theme = 'theme',
}

export function getStorage(key: StorageKeys): string | null {
  return localStorage.getItem(key);
}

export function setStorage(key: StorageKeys, value: string): void {
  localStorage.setItem(key, value);
}

export function removeStorage(key: StorageKeys): void {
  localStorage.removeItem(key);
}
