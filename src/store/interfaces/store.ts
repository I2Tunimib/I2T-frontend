/**
 * Alias type to explicitly indicate an ID.
 */
export type ID = string;

/**
 * Base payload.
 * Each ActionPayload interface should use this type.
 *
 * @example
 ```ts
    reducer: (state, action: PayloadAction<Payload<SpecificPayload>>) => {
      ...
    }
 ```
 */
export type Payload<T = any> = T & {
  undoable?: boolean;
};

/**
 * Base structure for a normalized state.
 *
 * @example
 ```ts
  // single object state
  interface Object {
    prop1: string;
    prop2: string;
  }
  // base state where each object is of type Object
  interface SomeState extends BaseState<Object> {}
 ```
 */
export interface BaseState<T> {
  byId: Record<ID, T>;
  allIds: ID[];
}
