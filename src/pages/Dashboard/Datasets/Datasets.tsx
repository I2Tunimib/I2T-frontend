import React, { FC, useEffect, useCallback } from "react";
import { TableListView } from "@components/kit";
import { useAppSelector } from "@hooks/store";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";
import { useAppDispatch } from "@hooks/store";
import { selectDatasets } from "@store/slices/datasets/datasets.selectors";
import { setCurrentDataset } from "@store/slices/datasets/datasets.slice";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import { Link, useRouteMatch } from "react-router-dom";
import { Button, IconButton, Stack, Dialog } from "@mui/material";
import DatasetAclDialog from "@components/core/DatasetAclDialog/DatasetAclDialog";
import { ReadMoreRounded } from "@mui/icons-material";
import deferMounting from "@components/HOC";
import globalStyles from "@styles/globals.module.scss";
import { useTableCollection } from "../useTableCollection";

interface DatasetsProps {
  onSelectionChange: (
    state: { kind: "dataset" | "table"; rows: any[] } | null,
  ) => void;
}

const DeferredTable = deferMounting(TableListView);

const Datasets: FC<DatasetsProps> = ({ onSelectionChange }) => {
  const { columns, rows } = useTableCollection(selectDatasets);
  const { path, url } = useRouteMatch();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentDataset(""));
  }, []);

  const handleRowSelection = (selectedRows: any[]) => {
    if (selectedRows.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: "dataset", rows: selectedRows });
    }
  };

  const auth = useAppSelector(selectIsLoggedIn);
  const currentUserId = auth?.user?.id;

  const Actions = useCallback(
    ({ mediaMatch, row }: { mediaMatch: boolean; row: any }) => {
      const [aclOpen, setAclOpen] = React.useState(false);
      const isOwner =
        currentUserId !== undefined &&
        String(currentUserId) === String(row.original.userId);
      return (
        <>
          <Stack direction="row" gap="8px" className={globalStyles.Actions}>
            {mediaMatch ? (
              <IconButton
                color="primary"
                size="small"
                component={Link}
                to={`${url}/${row.original.id}/tables`}
              >
                <ReadMoreRounded />
              </IconButton>
            ) : (
              // <Button
              //   size="small"
              //   component={Link}
              //   to={`${url}/${row.original.id}/tables`}
              //   endIcon={<ReadMoreRounded />}
              //   classes={{ endIcon: globalStyles.IconButton }}
              // >
              //   Explore
              // </Button>
              <></>
            )}

            {isOwner && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setAclOpen(true)}
              >
                Access
              </Button>
            )}
            {!isOwner && <div />}
          </Stack>
          <DatasetAclDialog
            open={aclOpen}
            onClose={() => setAclOpen(false)}
            datasetId={row.original.id}
          />
        </>
      );
    },
    [url, currentUserId],
  );

  // eslint-disable-next-line react/display-name
  const ActionsWithSelector = (props: any) => <Actions {...props} />;

  return (
    <DeferredTable
      columns={columns}
      data={rows}
      Actions={ActionsWithSelector}
      Icon={<FolderRoundedIcon color="action" />}
      onChangeRowSelected={handleRowSelection}
    />
  );
};

export default Datasets;
