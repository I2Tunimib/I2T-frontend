import { Draft } from "@reduxjs/toolkit";
import { ID, Payload } from "@store/interfaces/store";
import {
  AddColumnMetadataPayload,
  AddColumnTypePayload,
  AddColumnTypesPayload,
  ColumnMetadata,
  ColumnStatus,
  DeleteColumnMetadataPayload,
  TableState,
  UpdateColumnMetadataPayload,
  UpdateColumnTypeMatchesPayload,
} from "../interfaces/table";
import { TableReducer } from "./types";
import { withHistory } from "./history";
import { getColumn } from "../utils/table.utils";

type State = Draft<TableState>;

export const addColumnMetadata: TableReducer<Payload<AddColumnMetadataPayload>> = (
  state,
  { payload: { colId, type, prefix, value, undoable = true } },
) => {
  const column = getColumn(state, colId);
  switch (type) {
    case "entity": {
      return withHistory(state, undoable, (draft) => {
        const columnToUpdate = getColumn(draft, colId);
        if (!columnToUpdate.metadata || columnToUpdate.metadata.length === 0) {
          columnToUpdate.metadata = [{} as ColumnMetadata];
        }
        const { id, match, name, uri, ...rest } = value;
        const isMatching = match === "true";
        const contextKey = prefix ?? "";

        if (!columnToUpdate.context) columnToUpdate.context = {};
        if (!columnToUpdate.context[contextKey]) {
          const cleanUri = uri ?? "";
          const baseUri = cleanUri.substring(0, cleanUri.lastIndexOf("/") + 1);
          columnToUpdate.context[contextKey] = {
            reconciliated: 0,
            total: 0,
            uri: baseUri,
          };
        }

        if (
          columnToUpdate.metadata[0].entity &&
          columnToUpdate.metadata[0].entity.length > 0 &&
          isMatching
        ) {
          columnToUpdate.metadata[0].entity =
            columnToUpdate.metadata[0].entity.map((item) => ({ ...item, match: false }));
        }

        const newMeta = {
          id: `${id}`,
          match: isMatching,
          name: { value: name, uri },
          ...rest,
        };
        columnToUpdate.metadata = [
          {
            ...columnToUpdate.metadata[0],
            entity: [...(columnToUpdate.metadata[0].entity || []), newMeta],
          },
        ];
      });
    }
    case "property": {
      return withHistory(state, undoable, (draft) => {
        const columnToUpdate = getColumn(draft, colId);
        const {
          id,
          match,
          name,
          uri,
          obj,
          subj: valueSubj,
          description,
          score,
          prefix: valuePrefix,
          ...rest
        } = value;
        const isMatching = match === "true";
        const prefix = valuePrefix ?? "";
        // a property is added to the column it links from, by default this one
        const subj = valueSubj ?? colId;

        if (!columnToUpdate.context) columnToUpdate.context = {};
        if (!columnToUpdate.context[prefix]) {
          const cleanUri = uri ?? "";
          const baseUri = cleanUri.substring(0, cleanUri.lastIndexOf("/") + 1);
          columnToUpdate.context[prefix] = {
            reconciliated: 0,
            total: 0,
            uri: cleanUri.includes("wiki") ? `${baseUri}Property:` : baseUri,
          };
        }

        draft.entities.columns.allIds.forEach((currentId) => {
          if (currentId !== subj) {
            draft.entities.columns.byId[currentId].role = undefined;
          }
        });
        draft.entities.columns.byId[subj].role = "subject";

        const subjColumn = draft.entities.columns.byId[subj];
        if (!subjColumn.metadata || subjColumn.metadata.length === 0) {
          subjColumn.metadata = [{} as ColumnMetadata];
        }
        if (!subjColumn.metadata[0].property) {
          subjColumn.metadata[0].property = [];
        }

        if (subjColumn.metadata[0].property.length > 0 && isMatching) {
          subjColumn.metadata[0].property =
            subjColumn.metadata[0].property.map((item) => ({ ...item, match: true }));
        }

        const newMeta = {
          id: `${id}`,
          name,
          obj,
          match: isMatching,
          score,
          decider: "human" as const,
          ...rest,
        };
        subjColumn.metadata = [
          { ...subjColumn.metadata[0], property: [...subjColumn.metadata[0].property, newMeta] },
        ];
      });
    }
    default:
      return state;
  }
};

export const deleteColumnMetadata: TableReducer<Payload<DeleteColumnMetadataPayload>> = (
  state,
  { payload: { colId, type, metadataId, obj, undoable = true } },
) => {
  const column = getColumn(state, colId);
  switch (type) {
    case "entity": {
      if (
        !column.metadata.length ||
        !column.metadata[0].entity ||
        column.metadata[0].entity.length === 0
      ) {
        return state;
      }
      return withHistory(state, undoable, (draft) => {
        const columnToUpdate = getColumn(draft, colId);
        columnToUpdate.metadata[0].entity = columnToUpdate.metadata[0].entity!.filter(
          (item) => item.id !== metadataId,
        );
      });
    }
    case "property": {
      if (
        !column.metadata.length ||
        !column.metadata[0].property
      ) {
        return state;
      }
      return withHistory(state, undoable, (draft) => {
        const columnToUpdate = getColumn(draft, colId);
        const remaining = columnToUpdate.metadata[0].property!.filter(
          (item) => !(item.id === metadataId && item.obj === obj),
        );
        columnToUpdate.metadata[0].property = remaining;
        if (remaining.length === 0) {
          columnToUpdate.role = "";
        }
      });
    }
    default:
      return state;
  }
};

export const updateColumnMetadata: TableReducer<Payload<UpdateColumnMetadataPayload>> = (
  state,
  { payload: { metadataId, colId, undoable = true } },
) => {
  const column = getColumn(state, colId);
  if (
    !column.metadata.length ||
    !column.metadata[0].entity ||
    column.metadata[0].entity.length === 0
  ) {
    return state;
  }

  return withHistory(state, undoable, (draft) => {
    const columnToUpdate = getColumn(draft, colId);
    columnToUpdate.metadata[0].entity!.forEach((metaItem) => {
      if (metaItem.id === metadataId) {
        columnToUpdate.annotationMeta = {
          ...columnToUpdate.annotationMeta,
          match: {
            value: !metaItem.match,
            ...(!metaItem.match && { reason: "manual" }),
          },
        };
        metaItem.match = !metaItem.match;
      } else {
        metaItem.match = false;
      }
    });
  });
};

export const updateColumnPropertyMetadata: TableReducer<
  Payload<UpdateColumnMetadataPayload>
> = (
  state,
  { payload: { metadataId, obj, colId, undoable = true } },
) => {
  const column = getColumn(state, colId);
  if (
    !column.metadata.length ||
    !column.metadata[0].property ||
    column.metadata[0].property.length === 0
  ) {
    return state;
  }

  return withHistory(state, undoable, (draft) => {
    const columnToUpdate = getColumn(draft, colId);
    columnToUpdate.metadata[0].property!.forEach((metaItem) => {
      if (metaItem.id === metadataId && metaItem.obj === obj) {
        columnToUpdate.annotationMeta = {
          ...columnToUpdate.annotationMeta,
          match: {
            value: !metaItem.match,
            ...(!metaItem.match && { reason: "manual" }),
          },
        };
        metaItem.match = !metaItem.match;
      }
    });
  });
};

export const updateColumnRole: TableReducer<Payload<{ colId: ID; role: string }>> = (
  state,
  { payload: { colId, role } },
) =>
  withHistory(state, true, (draft) => {
    if (role !== "none") {
      draft.entities.columns.allIds.forEach((currentId) => {
        if (currentId !== colId) {
          draft.entities.columns.byId[currentId].role = undefined;
        }
      });
    }
    draft.entities.columns.byId[colId].role = role;
  });

export const updateColumnKind: TableReducer<Payload<{ colId: ID; kind: string }>> = (
  state,
  { payload: { colId, kind } },
) =>
  withHistory(state, true, (draft) => {
    draft.entities.columns.byId[colId].kind = kind;
  });

export const updateColumnDatatype: TableReducer<
  Payload<{ colId: ID; datatype: string }>
> = (state, { payload: { colId, datatype } }) =>
  withHistory(state, true, (draft) => {
    draft.entities.columns.byId[colId].datatype = datatype;
  });

export const addColumnType: TableReducer<Payload<AddColumnTypesPayload>> = (
  state,
  { payload },
) => {
  const { colId: payloadColId, newTypes } = payload;
  const colId =
    payloadColId ??
    state.ui.metadataColumnDialogColId ??
    Object.keys(state.ui.selectedColumnCellsIds)[0];

  return withHistory(state, true, (draft) => {
    const { columns } = draft.entities;
    const column = columns.byId[colId];
    if (!column) return;

    if (!column.metadata || column.metadata.length === 0) {
      column.metadata = [{ type: [] } as unknown as ColumnMetadata];
    }
    const types = (column.metadata[0].type ??= []);

    const added = newTypes.map((t) => {
      const { id, uri, ...restType } = t;
      return {
        match: true,
        id: id.includes(":") ? id.split(":")[1] : id,
        ...restType,
        score: 0,
        decider: "human" as const,
      };
    });

    added.forEach((newType) => {
      const idx = types.findIndex((t) => t.id === newType.id);
      if (idx !== -1) {
        types[idx] = { ...types[idx], ...newType };
      } else {
        types.push(newType);
      }
    });
  });
};

export const updateColumnTypeMatches: TableReducer<
  Payload<UpdateColumnTypeMatchesPayload>
> = (state, { payload: { typeIds, undoable = true } }) => {
  const colId =
    state.ui.metadataColumnDialogColId ??
    Object.keys(state.ui.selectedColumnCellsIds)[0];

  return withHistory(state, undoable, (draft) => {
    const { columns } = draft.entities;
    const column = columns.byId[colId];
    if (!column.metadata || column.metadata.length === 0) {
      column.metadata = [{ type: [] } as unknown as ColumnMetadata];
    }
    if (!column.metadata[0].type) {
      column.metadata[0].type = [];
    }
    column.metadata[0].type = column.metadata[0].type.map((type: any) => {
      const isSelected = typeIds.includes(type.id);
      return {
        ...type,
        match: isSelected,
        score: isSelected ? (type.score ?? 100) : 0,
      };
    });
  });
};

export { ColumnStatus };
