import React, { FC, useEffect, useCallback, useMemo, useState } from "react";
import { InlineInput, TableListView } from "@components/kit";
import { useAppSelector, useAppDispatch } from "@hooks/store";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";
import { selectDatasets } from "@store/slices/datasets/datasets.selectors";
import { setCurrentDataset } from "@store/slices/datasets/datasets.slice";
import { updateDataset, getDataset } from "@store/slices/datasets/datasets.thunk";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import { Link, useRouteMatch } from "react-router-dom";
import { Box, Button, IconButton, Stack, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Link as MatLink } from "@mui/material";
import DatasetAclDialog from "@components/core/DatasetAclDialog/DatasetAclDialog";
import { LockOpenOutlined, LockOutlined, ReadMoreRounded, EditOutlined } from "@mui/icons-material";
import deferMounting from "@components/HOC";
import globalStyles from "@styles/globals.module.scss";
import { useSnackbar } from "notistack";
import { useTableCollection } from "../useTableCollection";

interface DatasetNameCellProps {
  datasetItem: any;
  currentUserId: any;
  rows: any[];
  dispatch: any;
}

const DatasetNameCell: FC<DatasetNameCellProps> = ({ datasetItem, currentUserId, rows, dispatch }) => {
  const isOwner = currentUserId !== undefined && String(currentUserId) === String(datasetItem.userId);
  const { enqueueSnackbar } = useSnackbar();

  const [isEditing, setIsEditing] = useState(false);
  const [datasetName, setDatasetName] = useState(datasetItem.name);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  useEffect(() => {
    setDatasetName(datasetItem.name);
  }, [datasetItem.name]);

  const getUniqueDatasetName = (name: string) => {
    const baseName = name.trim() === "" ? "Unnamed dataset" : name.trim();
    const existingNames = new Set(
      rows
        .filter((t: any) => String(t.id) !== String(datasetItem.id))
        .map((t: any) => t.name)
    );

    if (!existingNames.has(baseName)) {
      return { uniqueName: baseName, wasRenamed: false };
    }

    let counter = 1;
    let newName = `${baseName}_${counter}`;
    while (existingNames.has(newName)) {
      counter++;
      newName = `${baseName}_${counter}`;
    }

    return { uniqueName: newName, wasRenamed: true };
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isOwner) return;
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX + 2, mouseY: e.clientY - 6 });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleStartRename = () => {
    handleCloseContextMenu();
    setIsEditing(true);
  };

  const handleBlur = async (e: any) => {
    const rawValue = e.target.value;
    const { uniqueName, wasRenamed } = getUniqueDatasetName(rawValue);
    setDatasetName(uniqueName);
    setIsEditing(false);

    if (uniqueName !== datasetItem.name) {
      try {
        const formData = new FormData();
        formData.append("name", uniqueName);
        await dispatch(
          updateDataset({ formData, datasetId: datasetItem.id })
        ).unwrap();
        dispatch(getDataset());
      } catch (error) {
        console.error("Error in renaming dataset:", error);
        setDatasetName(datasetItem.name);
      }
    }

    if (wasRenamed) {
      enqueueSnackbar("Dataset name provided already exists. A numeric suffix has been added.", {
        variant: "info",
        autoHideDuration: 3000,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  if (isEditing) {
    return (
      <div style={{ width: "250px", maxWidth: "250px", display: "inline-block", overflow: "hidden" }}>
        <InlineInput
          aria-label="Dataset name"
          value={datasetName}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={(e: any) => {
            setDatasetName(e.currentTarget.value);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{ fontSize: "inherit", fontWeight: "inherit", width: "100%" }}
          disabled={!isOwner}
        />
      </div>
    );
  }

  return (
    <div onContextMenu={handleContextMenu}>
      <MatLink
        component={Link}
        to={`/datasets/${datasetItem.id}/tables`}
        sx={{ textDecoration: "none" }}
      >
        {datasetName}
      </MatLink>
      {isOwner && (
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleStartRename}>
            <ListItemIcon>
              <EditOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </MenuItem>
        </Menu>
      )}
    </div>
  );
};

interface DatasetsProps {
  onSelectionChange: (
    state: { kind: "dataset" | "table"; rows: any[] } | null,
  ) => void;
  selectedRows?: any[];
}

const DeferredTable = deferMounting(TableListView);

const Datasets: FC<DatasetsProps> = ({ onSelectionChange, selectedRows = [] }) => {
  const { columns, rows } = useTableCollection(selectDatasets);
  const { path, url } = useRouteMatch();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentDataset(""));
  }, []);

  const handleRowSelection = (rowsSelected: any[]) => {
    if (rowsSelected.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: "dataset", rows: rowsSelected });
    }
  };

  const auth = useAppSelector(selectIsLoggedIn);
  const currentUserId = auth?.user?.id;

  const rowSelection = useMemo(() => {
    const selection: Record<string, boolean> = {};
    rows.forEach((row, index) => {
      if (selectedRows.some((selected) => selected.id === row.id)) {
        selection[index] = true;
      }
    });
    return selection;
  }, [rows, selectedRows]);

  const Actions = useCallback(
    ({ mediaMatch, row }: { mediaMatch: boolean; row: any }) => {
      const [aclOpen, setAclOpen] = React.useState(false);
      const isOwner =
        currentUserId !== undefined &&
        String(currentUserId) === String(row.original.userId);
      return (
        <>
          <Stack direction="row" gap="8px" className={globalStyles.Actions}>
            <Tooltip title={isOwner ? "Read & Write" : "Read Only"}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: isOwner ? "success.main" : "action.disabled",
                }}
              >
                {isOwner ? (
                  <LockOpenOutlined fontSize="small" />
                ) : (
                  <LockOutlined fontSize="small" />
                )}
              </Box>
            </Tooltip>
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

  const customColumns = useMemo(() => {
    return columns.map((col: any) => {
      if (col.accessorKey === "name" || col.id === "name") {
        return {
          ...col,
          cell: ({ row }: any) => (
            <DatasetNameCell
              datasetItem={row.original}
              currentUserId={currentUserId}
              rows={rows}
              dispatch={dispatch}
            />
          ),
        };
      }
      return col;
    });
  }, [columns, rows, currentUserId, dispatch]);

  return (
    <DeferredTable
      columns={customColumns}
      data={rows}
      Actions={ActionsWithSelector}
      Icon={<FolderRoundedIcon color="action" />}
      onChangeRowSelected={handleRowSelection}
      rowSelection={rowSelection}
    />
  );
};

export default Datasets;
