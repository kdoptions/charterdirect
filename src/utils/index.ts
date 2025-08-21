


export function createPageUrl(pageName: string) {
    // Convert camelCase/PascalCase to kebab-case
    // e.g., "BoatDetails" -> "boat-details", "MyBoats" -> "my-boats"
    return '/' + pageName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}