import React, { FC, useCallback, useEffect } from "react";
import deferMounting from "@components/HOC";
import { TableListView } from "@components/kit";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { ReadMoreRounded } from "@mui/icons-material";
import { Button, IconButton, LinearProgress, Stack } from "@mui/material";
import { ID } from "@store/interfaces/store";
import {
  selectCurrentDatasetTables,
  selectGetTablesDatasetStatus,
  selectDatasets,
} from "@store/slices/datasets/datasets.selectors";
import { getTablesByDataset } from "@store/slices/datasets/datasets.thunk";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";
import { Link, useParams } from "react-router-dom";
import TableAclDialog from "@components/core/TableAclDialog/TableAclDialog";
import globalStyles from "@styles/globals.module.scss";
import { useTableCollection } from "../useTableCollection";

interface TablesProps {
  onSelectionChange: (
    state: { kind: "dataset" | "table"; rows: any[] } | null,
  ) => void;
}

const DeferredTable = deferMounting(TableListView);

const Tables: FC<TablesProps> = ({ onSelectionChange }) => {
  const { columns, rows } = useTableCollection(selectCurrentDatasetTables);
  const { datasetId } = useParams<{ datasetId: ID }>();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectGetTablesDatasetStatus);

  const auth = useAppSelector(selectIsLoggedIn);
  const currentUserId = auth?.user?.id;

  // Get current dataset to check ownership
  const { rows: datasetRows } = useTableCollection(selectDatasets);
  const currentDataset = datasetRows.find(
    (r: any) => String(r.id) === String(datasetId),
  );
  const isDatasetOwner =
    currentUserId !== undefined &&
    currentDataset !== undefined &&
    String(currentUserId) === String((currentDataset as any).userId);
  const datasetVisibility: "private" | "public" | undefined = (
    currentDataset as any
  )?.visibility;

  useEffect(() => {
    dispatch(getTablesByDataset({ datasetId }));
  }, [datasetId]);

  const handleRowSelection = (selectedRows: any[]) => {
    if (selectedRows.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: "table", rows: selectedRows });
    }
  };

  const Actions = useCallback(
    ({ mediaMatch, row }: { mediaMatch: boolean; row: any }) => {
      const [aclOpen, setAclOpen] = React.useState(false);
      return (
        <>
          <Stack direction="row" gap="8px" className={globalStyles.Actions}>
            {mediaMatch ? (
              <IconButton
                color="primary"
                size="small"
                component={Link}
                to={`/datasets/${datasetId}/tables/${row.original.id}?view=table`}
              >
                <ReadMoreRounded />
              </IconButton>
            ) : (
              <Button
                size="small"
                component={Link}
                to={`/datasets/${datasetId}/tables/${row.original.id}?view=table`}
                endIcon={<ReadMoreRounded />}
                classes={{ endIcon: globalStyles.IconButton }}
              >
                Explore
              </Button>
            )}
            {isDatasetOwner && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setAclOpen(true)}
              >
                Access
              </Button>
            )}
          </Stack>
          {isDatasetOwner && (
            <TableAclDialog
              open={aclOpen}
              onClose={() => setAclOpen(false)}
              datasetId={String(datasetId)}
              tableId={String(row.original.id)}
              datasetVisibility={datasetVisibility}
              onChange={() => dispatch(getTablesByDataset({ datasetId }))}
            />
          )}
        </>
      );
    },
    [datasetId, isDatasetOwner, datasetVisibility],
  );

  return (
    <>
      {loading ? (
        <LinearProgress />
      ) : (
        <DeferredTable
          columns={columns}
          data={rows}
          Actions={Actions}
          onChangeRowSelected={handleRowSelection}
        />
      )}
    </>
  );
};

export default Tables;
