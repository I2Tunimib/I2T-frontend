import datasetAPI from "@services/api/datasets";
import { useAclManager } from "./acl";

type Options = {
  open: boolean;
  datasetId: string;
  onChange?: () => void;
};

/** Access control of a dataset: its owner, viewers and editors. */
export const useDatasetAcl = ({ open, datasetId, onChange }: Options) =>
  useAclManager({
    open,
    resourceKey: datasetId,
    load: async () => (await datasetAPI.getDatasetInfo({ datasetId })).data,
    addUser: (userId, role) => datasetAPI.addAclUser(datasetId, userId, role),
    removeUser: (userId, role) =>
      datasetAPI.removeAclUser(datasetId, userId, role),
    onMutated: onChange,
  });
