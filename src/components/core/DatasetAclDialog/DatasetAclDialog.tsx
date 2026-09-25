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
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import datasetAPI from "@services/api/datasets";
import usersAPI from "@services/api/users";
import { useAppSelector } from "@hooks/store";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";

type Props = {
  open: boolean;
  onClose: () => void;
  datasetId: string;
  onChange?: () => void;
};

const DatasetAclDialog: FC<Props> = ({
  open,
  onClose,
  datasetId,
  onChange,
}) => {
  const [dataset, setDataset] = useState<any | null>(null);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<any[]>([]);
  const [section, setSection] = useState<"viewer" | "editor">("viewer");
  const [viewersInfo, setViewersInfo] = useState<any[]>([]);
  const [editorsInfo, setEditorsInfo] = useState<any[]>([]);
  const [viewerFilter, setViewerFilter] = useState("");
  const [editorFilter, setEditorFilter] = useState("");

  const auth = useAppSelector(selectIsLoggedIn);
  const currentUserId = auth?.user?.id;
  const isOwner = Boolean(
    dataset && String(dataset.userId) === String(currentUserId),
  );

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const resp = await datasetAPI.getDatasetInfo({ datasetId });
        setDataset(resp.data);
        setVisibility((resp.data as any)?.visibility || "private");
      } catch (e) {
        console.error(e);
      }
    })();
  }, [open, datasetId]);

  // fetch display info for current viewers/editors
  useEffect(() => {
    const fetchInfos = async () => {
      if (!dataset) return;
      const v = dataset.viewers || [];
      const e = dataset.editors || [];
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
  }, [dataset]);

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

  const handleAdd = async () => {
    if (!selectedUsersToAdd || selectedUsersToAdd.length === 0) return;
    try {
      const promises = selectedUsersToAdd.map((u) =>
        datasetAPI.addAclUser(datasetId, String(u.id), section),
      );
      await Promise.all(promises);
      // refresh
      const resp = await datasetAPI.getDatasetInfo({ datasetId });
      setDataset(resp.data);
      if (onChange) onChange();
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
      await datasetAPI.removeAclUser(datasetId, String(targetId), kind);
      const resp = await datasetAPI.getDatasetInfo({ datasetId });
      setDataset(resp.data);
      if (onChange) onChange();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || e.message);
    }
  };

  const handleVisibilityChange = async (value: "private" | "public") => {
    setVisibility(value);
    try {
      await datasetAPI.setVisibility(datasetId, value);
      const resp = await datasetAPI.getDatasetInfo({ datasetId });
      setDataset(resp.data);
      if (onChange) onChange();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || e.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography>Dataset access control</Typography>
        <IconButton onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: "70vh" }}>
        {!dataset ? (
          <div>Loading...</div>
        ) : (
          <Stack gap={2}>
            <div>
              <Typography variant="subtitle1">Visibility</Typography>
              {!isOwner && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Only the owner can modify access control
                </Typography>
              )}
              <FormControl component="fieldset" disabled={!isOwner}>
                <RadioGroup
                  value={visibility}
                  onChange={(e, v) =>
                    handleVisibilityChange(v as "private" | "public")
                  }
                  row
                >
                  <FormControlLabel
                    value="private"
                    control={<Radio />}
                    label="Private (only owner/viewers/editors)"
                  />
                  <FormControlLabel
                    value="public"
                    control={<Radio />}
                    label="Public (any authenticated user can view)"
                  />
                </RadioGroup>
              </FormControl>
            </div>

            <Divider />

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="viewers-content"
                id="viewers-header"
              >
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
                        key={`v-${u.id}`}
                        secondaryAction={
                          dataset &&
                          String(dataset.userId) === String(currentUserId) ? (
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
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="editors-content"
                id="editors-header"
              >
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
                        key={`e-${u.id}`}
                        secondaryAction={
                          dataset &&
                          String(dataset.userId) === String(currentUserId) ? (
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
                    // "& .MuiAutocomplete-inputRoot": {
                    //   paddingTop: 6,
                    //   paddingBottom: 6,
                    //   minHeight: 40,
                    // },
                    // "& .MuiChip-root": { height: 28, fontSize: "0.85rem" },
                    // "& .MuiAutocomplete-endAdornment": {
                    //   top: "calc(50% - 12px)",
                    // },
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
                      InputProps={{ ...params.InputProps }}
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                    },
                    "& input": {
                      height: "40px",
                      padding: "0 12px",
                    },
                  }}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </TextField>
                <Button
                  variant="contained"
                  onClick={handleAdd}
                  disabled={
                    selectedUsersToAdd.length === 0 ||
                    !(
                      dataset &&
                      String(dataset.userId) === String(currentUserId)
                    )
                  }
                >
                  Add
                </Button>
              </Stack>
            </div>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatasetAclDialog;
