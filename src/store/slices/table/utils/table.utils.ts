import { ID } from '../interfaces/table';

/**
 * Add a property to another object given old and new object.
 */
export const addObject = <T, K>(oldObject: T, newObject: T): T => ({
  ...oldObject,
  ...newObject
});

/**
 * Remove property of an object given the property
 */
export const removeObject = <T, K extends keyof T>(object: T, property: K): Omit<T, K> => {
  const { [property]: omit, ...rest } = object;
  return rest;
};

/**
 * Toggle object by ID.
 */
export const toggleObject = <T>(oldObject: Record<ID, T>, id: ID, value: T) => {
  if (oldObject[id]) {
    return removeObject(oldObject, id);
  }
  const newObject = { [id]: value };
  return addObject(oldObject, newObject);
};

/**
 * Get rowId and colId from cellId.
 */
export const getIdsFromCell = (cellId: ID) => cellId.split('$') as [ID, ID];
