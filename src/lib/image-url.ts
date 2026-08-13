const API_URL = import.meta.env.VITE_API_URL as string;
// Strip trailing /api to get base server URL
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_URL}${path}`;
}