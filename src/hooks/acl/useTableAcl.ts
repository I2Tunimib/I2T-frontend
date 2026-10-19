import { useEffect, useState } from "react";
import datasetAPI from "@services/api/datasets";
import { useAclManager } from "./acl";

/** "restricted" = the table keeps its own viewers/editors; null = inherits the dataset ACL. */
export type TableVisibility = "restricted" | null;

type TableAcl = {
  datasetOwnerId?: string | number;
  visibility?: TableVisibility;
  viewers?: string[];
  editors?: string[];
};

type Options = {
  open: boolean;
  datasetId: string;
  tableId: string;
  /** Called when the dialog closes after the ACL was modified. */
  onChange?: () => void;
};

/** Access control of a table: its visibility plus its own viewers/editors. */
export const useTableAcl = ({ open, datasetId, tableId, onChange }: Options) => {
  const [visibility, setVisibility] = useState<TableVisibility>(null);
  const [isDirty, setIsDirty] = useState(false);

  const manager = useAclManager<TableAcl>({
    open,
    resourceKey: `${datasetId}/${tableId}`,
    load: async () =>
      (await datasetAPI.getTableAcl(datasetId, tableId)).data as TableAcl,
    addUser: (userId, role) =>
      datasetAPI.addTableAclUser(datasetId, tableId, userId, role),
    removeUser: (userId, role) =>
      datasetAPI.removeTableAclUser(datasetId, tableId, userId, role),
    onLoaded: (acl) => setVisibility(acl.visibility ?? null),
    onMutated: () => setIsDirty(true),
  });

  useEffect(() => {
    if (open) setIsDirty(false);
  }, [open, datasetId, tableId]);

  const changeVisibility = (value: TableVisibility) => {
    setVisibility(value);
    return manager.run(async () => {
      await datasetAPI.setTableVisibility(datasetId, tableId, value);
      await manager.reload();
      setIsDirty(true);
    });
  };

  /** Tell the parent about modifications, once, when the dialog closes. */
  const notifyIfDirty = () => {
    if (isDirty) onChange?.();
  };

  return { ...manager, visibility, changeVisibility, notifyIfDirty };
};
