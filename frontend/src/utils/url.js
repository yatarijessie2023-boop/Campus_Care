const uploadBase = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:3000';

export function resolveUploadUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${uploadBase}${path.startsWith('/') ? '' : '/'}${path}`;
}
