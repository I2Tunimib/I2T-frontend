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
