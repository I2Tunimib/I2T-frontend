/**
 * Returns true if the item is an object, false otherwise.
 */
export const isObject = (item: any): boolean => (typeof item === 'object' && item !== null && !Array.isArray(item));
