/**
 * Who may edit a table. Pure so it can be tested without the store or API.
 *
 * Dataset-level: the owner or an explicit dataset editor can edit.
 * A table whose visibility is "restricted" has its own ACL: dataset editors
 * are not automatically table editors (the owner always can).
 */
type DatasetAcl = { userId?: unknown; editors?: unknown };
type TableAcl = { visibility?: string | null; editors?: unknown };

const includesId = (ids: unknown, id: string) =>
  Array.isArray(ids) && ids.map(String).includes(id);

export const canEditTable = (
  userId: string | number | undefined,
  dataset: DatasetAcl | null | undefined,
  tableAcl?: TableAcl | null,
): boolean => {
  if (!dataset || userId === undefined) return false;
  const uid = String(userId);

  const isOwner = String(dataset.userId) === uid;
  const datasetCanEdit = isOwner || includesId(dataset.editors, uid);

  if (tableAcl?.visibility === "restricted" && !isOwner) {
    return datasetCanEdit && includesId(tableAcl.editors, uid);
  }
  return datasetCanEdit;
};
