import { BaseState, ID } from "@store/interfaces/store";

/** Turn a list of entities into the normalized { byId, allIds } state. */
export const normalize = <T extends { id: ID }>(items: T[]): BaseState<T> =>
  items.reduce<BaseState<T>>(
    (acc, item) => {
      if (!(item.id in acc.byId)) acc.allIds.push(item.id);
      acc.byId[item.id] = item;
      return acc;
    },
    { byId: {}, allIds: [] },
  );
