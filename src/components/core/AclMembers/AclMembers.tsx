import React, { FC, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AclManager, AclRole, AclUser } from "@hooks/acl";
import { useAppSelector } from "@hooks/store";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";

type MemberListProps = {
  title: string;
  role: AclRole;
  users: AclUser[];
  isOwner: boolean;
  currentUserId?: string | number;
  onRemove: (userId: string | number, role: AclRole) => void;
};

const MemberList: FC<MemberListProps> = ({
  title,
  role,
  users,
  isOwner,
  currentUserId,
  onRemove,
}) => {
  const [filter, setFilter] = useState("");
  const visible = users.filter((u) =>
    `${u.username} ${u.email || ""}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">
          {title} ({users.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TextField
          size="small"
          placeholder={`Filter ${title.toLowerCase()}`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          fullWidth
          sx={{ mb: 1 }}
        />
        <List>
          {visible.map((u) => {
            const isMe = String(u.id) === String(currentUserId);
            return (
              <ListItem
                key={`${role}-${u.id}`}
                secondaryAction={
                  isOwner && !isMe ? (
                    <IconButton edge="end" onClick={() => onRemove(u.id, role)}>
                      <DeleteRounded />
                    </IconButton>
                  ) : null
                }
              >
                <ListItemText
                  primary={
                    <span>
                      {u.username} ({u.email || ""})
                      {isMe && <span style={{ fontStyle: "italic" }}> - me</span>}
                    </span>
                  }
                  secondary={u.roles?.join(", ")}
                />
              </ListItem>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

type Props = {
  acl: AclManager;
  /** Only the owner can add or remove members. */
  isOwner: boolean;
};

/** Viewers and editors lists, with a form to add users, for an ACL dialog. */
const AclMembers: FC<Props> = ({ acl, isOwner }) => {
  const {
    viewersInfo,
    editorsInfo,
    searchResults,
    selectedUsers,
    setSelectedUsers,
    query,
    setQuery,
    section,
    setSection,
    add,
    remove,
  } = acl;
  const currentUserId = useAppSelector(selectIsLoggedIn).user?.id;

  return (
    <>
      <MemberList
        title="Viewers"
        role="viewer"
        users={viewersInfo}
        isOwner={isOwner}
        currentUserId={currentUserId}
        onRemove={remove}
      />
      <MemberList
        title="Editors"
        role="editor"
        users={editorsInfo}
        isOwner={isOwner}
        currentUserId={currentUserId}
        onRemove={remove}
      />
      <Divider />
      <div>
        <Typography variant="subtitle2">Add user</Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <Autocomplete
            multiple
            size="small"
            options={searchResults.filter(
              (u) => String(u.id) !== String(currentUserId),
            )}
            value={selectedUsers}
            onChange={(_, v) => setSelectedUsers(v)}
            getOptionLabel={(o) => `${o.username} (${o.email || ""})`}
            filterSelectedOptions
            sx={{ flex: 1 }}
            ListboxProps={{ style: { maxHeight: 240 } }}
            renderTags={(value, getTagProps) =>
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
                placeholder="Search username or email"
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{ ...params.InputProps }}
              />
            )}
            noOptionsText={!query ? "Type to search users..." : "No users found"}
            disabled={!isOwner}
          />
          <TextField
            select
            value={section}
            onChange={(e) => setSection(e.target.value as AclRole)}
            SelectProps={{ native: true }}
            sx={{
              "& .MuiOutlinedInput-root": { height: "40px" },
              "& input": { height: "40px", padding: "0 12px" },
            }}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </TextField>
          <Button
            variant="contained"
            onClick={add}
            disabled={selectedUsers.length === 0 || !isOwner}
          >
            Add
          </Button>
        </Stack>
      </div>
    </>
  );
};

export default AclMembers;
