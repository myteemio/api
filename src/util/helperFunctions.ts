
export function makeUrlSafe(name: string) {
  // Replace spaces with hyphens
  var urlSafeName = name.replace(/\s+/g, '-');
  // Remove non-alphanumeric characters (except hyphens)
  urlSafeName = urlSafeName.replace(/[^a-zA-Z0-9\-]/g, '');
  // Convert to lowercase
  return urlSafeName.toLowerCase();
}