export const phonePlaceholder =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="%23f0f4f8"/><rect x="177" y="54" width="126" height="252" rx="24" fill="%23ffffff" stroke="%230f6b45" stroke-width="8"/><rect x="195" y="78" width="90" height="180" rx="12" fill="%23e2ece9"/><circle cx="240" cy="278" r="8" fill="%230f6b45"/><text x="240" y="172" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230f6b45" text-anchor="middle">PHONE</text></svg>';

export function resolveProductImage(imageName) {
  if (!imageName) return phonePlaceholder;
  if (imageName.startsWith('http://') || imageName.startsWith('https://') || imageName.startsWith('data:')) {
    return imageName;
  }
  return `/images/${imageName}`;
}

export function withImageFallback(event) {
  if (event.currentTarget.src !== phonePlaceholder) {
    event.currentTarget.src = phonePlaceholder;
  }
}

