import React, { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Autocomplete,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  Alert,
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import datasetAPI from "@services/api/datasets";
import usersAPI from "@services/api/users";
import { useAppSelector } from "@hooks/store";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";

type TableVisibility = "private" | "public" | null;

type Props = {
  open: boolean;
  onClose: () => void;
  datasetId: string;
  tableId: string;
  datasetVisibility?: "private" | "public";
  onChange?: () => void;
};

const TableAclDialog: FC<Props> = ({
  open,
  onClose,
  datasetId,
  tableId,
  datasetVisibility,
  onChange,
}) => {
  const [tableAcl, setTableAcl] = useState<any | null>(null);
  const [visibility, setVisibility] = useState<TableVisibility>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<any[]>([]);
  const [section, setSection] = useState<"viewer" | "editor">("viewer");
  const [viewersInfo, setViewersInfo] = useState<any[]>([]);
  const [editorsInfo, setEditorsInfo] = useState<any[]>([]);
  const [viewerFilter, setViewerFilter] = useState("");
  const [editorFilter, setEditorFilter] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const auth = useAppSelector(selectIsLoggedIn);
  const currentUserId = auth?.user?.id;
  const isOwner = Boolean(
    tableAcl && String(tableAcl.datasetOwnerId) === String(currentUserId),
  );

  // Fetch table ACL info when dialog opens
  useEffect(() => {
    if (!open) return;
    setIsDirty(false);
    (async () => {
      try {
        const resp = await datasetAPI.getTableAcl(datasetId, tableId);
        setTableAcl(resp.data);
        setVisibility((resp.data as any)?.visibility ?? null);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [open, datasetId, tableId]);

  // Fetch display info for current viewers/editors
  useEffect(() => {
    const fetchInfos = async () => {
      if (!tableAcl) return;
      const v = tableAcl.viewers || [];
      const e = tableAcl.editors || [];
      try {
        const fetchUser = async (id: string) => {
          try {
            const r = await usersAPI.search(String(id));
            return (r.data && r.data[0]) || { id, username: String(id) };
          } catch (_) {
            return { id, username: String(id) };
          }
        };
        const vi = await Promise.all(
          v.map((id: string) => fetchUser(String(id))),
        );
        const ei = await Promise.all(
          e.map((id: string) => fetchUser(String(id))),
        );
        setViewersInfo(vi);
        setEditorsInfo(ei);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInfos();
  }, [tableAcl]);

  // Debounced user search
  useEffect(() => {
    const t = setTimeout(() => {
      if (!query) return setSearchResults([]);
      const role = section === "editor" ? "editor" : undefined;
      usersAPI
        .search(query, role)
        .then((r) => setSearchResults(r.data))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [query, section]);

  const refreshAcl = async () => {
    const resp = await datasetAPI.getTableAcl(datasetId, tableId);
    setTableAcl(resp.data);
    setIsDirty(true);
  };

  const handleClose = () => {
    if (isDirty && onChange) onChange();
    onClose();
  };

  const handleAdd = async () => {
    if (!selectedUsersToAdd || selectedUsersToAdd.length === 0) return;
    try {
      const promises = selectedUsersToAdd.map((u) => {
        if (section === "viewer")
          return datasetAPI.addTableViewer(datasetId, tableId, String(u.id));
        return datasetAPI.addTableEditor(datasetId, tableId, String(u.id));
      });
      await Promise.all(promises);
      await refreshAcl();
      setQuery("");
      setSearchResults([]);
      setSelectedUsersToAdd([]);
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || e.message);
    }
  };

  const handleRemove = async (targetId: string, kind: "viewer" | "editor") => {
    try {
      if (kind === "viewer")
        await datasetAPI.removeTableViewer(
          datasetId,
          tableId,
          String(targetId),
        );
      else
        await datasetAPI.removeTableEditor(
          datasetId,
          tableId,
          String(targetId),
        );
      await refreshAcl();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || e.message);
    }
  };

  const handleVisibilityChange = async (value: TableVisibility) => {
    setVisibility(value);
    try {
      await datasetAPI.setTableVisibility(datasetId, tableId, value);
      await refreshAcl();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || e.message);
    }
  };

  // Effective access description
  const effectiveLabel = (() => {
    if (visibility === "private") {
      return datasetVisibility === "public"
        ? "Effective: Private — overrides the public dataset. Only the owner and users listed below can access this table."
        : "Effective: Private — only the owner and users listed below can access this table.";
    }
    if (visibility === "public") {
      return datasetVisibility === "private"
        ? "Effective: Private — the dataset is private, so table 'public' setting has no additional effect."
        : "Effective: Public — any authenticated user can view this table.";
    }
    // null = inherit
    return datasetVisibility === "public"
      ? "Effective: Inheriting from dataset — table is publicly accessible (dataset is public)."
      : "Effective: Inheriting from dataset — table follows the dataset's private access rules.";
  })();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography>Table access control</Typography>
        <IconButton onClick={handleClose}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: "70vh" }}>
        {!tableAcl ? (
          <div>Loading...</div>
        ) : (
          <Stack gap={2}>
            <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ py: 0.5 }}>
              {effectiveLabel}
            </Alert>
            <div>
              <Typography variant="subtitle1">Table visibility</Typography>
              {!isOwner && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Only the dataset owner can modify table access control
                </Typography>
              )}
              <FormControl component="fieldset" disabled={!isOwner}>
                <RadioGroup
                  value={visibility === null ? "inherit" : visibility}
                  onChange={(_, v) => {
                    const val =
                      v === "inherit" ? null : (v as "private" | "public");
                    handleVisibilityChange(val);
                  }}
                >
                  <FormControlLabel
                    value="inherit"
                    control={<Radio />}
                    label="Inherit from dataset (no table-level restriction)"
                  />
                  <FormControlLabel
                    value="private"
                    control={<Radio />}
                    label="Private (only owner + explicitly listed users can access)"
                  />
                  <FormControlLabel
                    value="public"
                    control={<Radio />}
                    label="Public (all users with dataset access can view)"
                  />
                </RadioGroup>
              </FormControl>
            </div>

            {visibility === "private" && (
              <>
                <Divider />
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                      Viewers ({(viewersInfo || []).length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      size="small"
                      placeholder="Filter viewers"
                      value={viewerFilter}
                      onChange={(e) => setViewerFilter(e.target.value)}
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <List>
                      {(viewersInfo || [])
                        .filter((u: any) =>
                          `${u.username} ${u.email || ""}`
                            .toLowerCase()
                            .includes(viewerFilter.toLowerCase()),
                        )
                        .map((u: any) => (
                          <ListItem
                            key={`tv-${u.id}`}
                            secondaryAction={
                              isOwner ? (
                                <IconButton
                                  edge="end"
                                  onClick={() => handleRemove(u.id, "viewer")}
                                >
                                  <DeleteRounded />
                                </IconButton>
                              ) : null
                            }
                          >
                            <ListItemText
                              primary={`${u.username} (${u.email || ""})`}
                              secondary={u.roles?.join(", ")}
                            />
                          </ListItem>
                        ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                      Editors ({(editorsInfo || []).length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      size="small"
                      placeholder="Filter editors"
                      value={editorFilter}
                      onChange={(e) => setEditorFilter(e.target.value)}
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <List>
                      {(editorsInfo || [])
                        .filter((u: any) =>
                          `${u.username} ${u.email || ""}`
                            .toLowerCase()
                            .includes(editorFilter.toLowerCase()),
                        )
                        .map((u: any) => (
                          <ListItem
                            key={`te-${u.id}`}
                            secondaryAction={
                              isOwner ? (
                                <IconButton
                                  edge="end"
                                  onClick={() => handleRemove(u.id, "editor")}
                                >
                                  <DeleteRounded />
                                </IconButton>
                              ) : null
                            }
                          >
                            <ListItemText
                              primary={`${u.username} (${u.email || ""})`}
                              secondary={u.roles?.join(", ")}
                            />
                          </ListItem>
                        ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
                <Divider />
                <div>
                  <Typography variant="subtitle2">Add user</Typography>
                  <Stack direction="row" gap={1} alignItems="center">
                    <Autocomplete
                      multiple
                      size="small"
                      options={
                        section === "editor"
                          ? searchResults.filter(
                              (u) =>
                                Array.isArray(u.roles) &&
                                (u.roles.includes("editor") ||
                                  u.roles.includes("admin")),
                            )
                          : searchResults
                      }
                      value={selectedUsersToAdd}
                      onChange={(_, v) => setSelectedUsersToAdd(v as any[])}
                      getOptionLabel={(o: any) =>
                        `${o.username} (${o.email || ""})`
                      }
                      filterSelectedOptions
                      sx={{
                        flex: 1,
                        "& .MuiAutocomplete-inputRoot": {
                          paddingTop: 6,
                          paddingBottom: 6,
                          minHeight: 40,
                        },
                        "& .MuiChip-root": {
                          height: 28,
                          fontSize: "0.85rem",
                        },
                        "& .MuiAutocomplete-endAdornment": {
                          top: "calc(50% - 12px)",
                        },
                      }}
                      ListboxProps={{ style: { maxHeight: 240 } }}
                      renderTags={(value: any[], getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={`${option.username}`}
                            {...getTagProps({ index })}
                            key={option.id}
                            size="small"
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder={
                            section === "editor"
                              ? "Search users with editor/admin role"
                              : "Search username or email"
                          }
                          onChange={(e) => setQuery(e.target.value)}
                          InputProps={{
                            ...params.InputProps,
                            sx: { height: 36 },
                          }}
                        />
                      )}
                      noOptionsText={
                        section === "editor"
                          ? "No users with editor/admin role found"
                          : "No users found"
                      }
                      disabled={!isOwner}
                    />
                    <TextField
                      select
                      value={section}
                      onChange={(e) => setSection(e.target.value as any)}
                      SelectProps={{ native: true }}
                      sx={{ width: 120 }}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </TextField>
                    <Button
                      variant="contained"
                      onClick={handleAdd}
                      disabled={selectedUsersToAdd.length === 0 || !isOwner}
                    >
                      Add
                    </Button>
                  </Stack>
                </div>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableAclDialog;
