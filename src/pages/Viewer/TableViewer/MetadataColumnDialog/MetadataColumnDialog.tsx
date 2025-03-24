import {
  Box,
  Button,
  Dialog,
  DialogProps,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { FC, ReactNode, SyntheticEvent, useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@hooks/store";
import { selectAppConfig } from "@store/slices/config/config.selectors";
import {
  selectColumnKind,
  selectColumnRole,
  selecteSelectedColumnId,
  selectIsViewOnly,
} from "@store/slices/table/table.selectors";
import { set } from "lodash";
import {
  undo,
  updateColumnKind,
  updateColumnRole,
  updateUI,
} from "@store/slices/table/table.slice";
import EntityTab from "./EntityTab";
import TypeTab from "./TypeTab";
import PropertyTab from "./PropertyTab";

type TabPanelProps = {
  children?: ReactNode;
  index: number;
  value: number;
};
type ReduxEditObject = {
  type: string;
  payload: Object;
};
const TabPanel: FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return value === index ? (
    <Stack
      flexGrow={1}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Stack flexGrow={1}>{children}</Stack>
    </Stack>
  ) : null;
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const Content = () => {
  const [value, setValue] = useState(0);
  const [editsState, setEditsState] = useState<ReduxEditObject[]>([]);
  const { API } = useAppSelector(selectAppConfig);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const kind = useAppSelector(selectColumnKind);
  const currentColId = useAppSelector(selecteSelectedColumnId);
  const [currentKind, setCurrentKind] = useState(kind);
  const role = useAppSelector(selectColumnRole);
  const [currentRole, setCurrentRole] = useState(role);
  const dispatch = useAppDispatch();
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  /**
   * Function used to remove the last edit of a specific type from the editsState array,
   * used in cases like updating the column type, where only the last
   * edit is kept to the same information
   * @param type : the string used to identify the type of the edit
   * @returns the new array of edits without the last edit of the specified type
   */
  const removeLastEditOfType = (type: string) => {
    // Find the index of the last occurrence of the element with the specified type
    const lastIndex = editsState.map((edit) => edit.type).lastIndexOf(type);

    // If the type is not found, return the original array
    if (lastIndex === -1) {
      return editsState;
    }

    // Create a new array that excludes the element at the found index
    return editsState.filter((_, index) => index !== lastIndex);
  };

  /**
   * Adds an edit to the editsState array and optionally increments the undo steps.
   * If removeLast is true, it removes the last edit of the
   * specified type before adding the new edit.
   * @param {ReduxEditObject} editFunction - The edit object to be added.
   * @param {boolean} [undoable=false] - If true, increments the undo steps.
   * @param {boolean} [removeLast=false] - If true, removes the last edit of the specified type before adding the new edit.
   */
  const handleAddEdit = (
    editFunction: ReduxEditObject,
    undoable: boolean = false,
    removeLast: boolean = false
  ) => {
    //increment the number of undo steps if undoable
    //remove last edit of the same type if needed and set the new state else add the new edit
    if (removeLast) {
      const filteredEdits = removeLastEditOfType(editFunction.type);
      setEditsState([...filteredEdits, editFunction]);
    } else setEditsState([...editsState, editFunction]);
  };

  /**
   * Applies all the edits stored in the editsState array by dispatching them.
   * Clears the editsState array and closes the metadata column dialog.
   * Logs any errors encountered during the process.
   */
  const handleApplyEdits = () => {
    try {
      for (const edit of editsState) {
        dispatch(edit);
      }
      setEditsState([]);

      dispatch(updateUI({ openMetadataColumnDialog: false }));
    } catch (error) {
      console.error("Error during edits apply", error);
    }
  };

  /**
   * Resets the edits state and undo steps, and closes the metadata column dialog.
   * Logs any errors encountered during the process.
   */
  const handleCancel = () => {
    try {
      setEditsState([]);

      dispatch(updateUI({ openMetadataColumnDialog: false }));
    } catch (error) {
      console.error("Error during edits apply", error);
    }
  };
  const handleKindChange = (event: SelectChangeEvent<string>) => {
    setCurrentKind(event.target.value);
    const edit = updateColumnKind({
      colId: currentColId,
      kind: event.target.value,
    });
    handleAddEdit(edit, true, true);
  };
  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setCurrentRole(event.target.value);
    const edit = updateColumnRole({
      colId: currentColId,
      role: event.target.value,
    });
    handleAddEdit(edit, true, true);
  };
  return (
    <Stack>
      <Stack direction="row" alignItems="center" marginTop="15px" gap="10px">
        <InputLabel style={{ marginLeft: 15 }} id="kind-select-label">
          Column Kind
        </InputLabel>
        <Select
          labelId="kind-select-label"
          value={currentKind}
          onChange={handleKindChange}
          variant="outlined"
          size="small"
        >
          <MenuItem value="entity">Named Entity</MenuItem>
          <MenuItem value="literal">Literal</MenuItem>
          <MenuItem value="none">None</MenuItem>
        </Select>
        <InputLabel style={{ marginLeft: 15 }} id="role-select-label">
          Column Role
        </InputLabel>

        <Select
          labelId="role-select-label"
          value={currentRole}
          onChange={handleRoleChange}
          variant="outlined"
          size="small"
        >
          <MenuItem value="subject">Subject</MenuItem>
          <MenuItem value="none">None</MenuItem>
        </Select>

        <Stack direction="row" marginLeft="auto" marginRight="15px" gap="10px">
          <Button onClick={handleCancel} variant="outlined">
            {API.ENDPOINTS.SAVE && !isViewOnly ? "Cancel" : "Close"}
          </Button>
          {API.ENDPOINTS.SAVE && !isViewOnly && (
            <Button onClick={handleApplyEdits} variant="outlined">
              Confirm
            </Button>
          )}
        </Stack>
      </Stack>
      <Tabs
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#FFF",
        }}
        value={value}
        onChange={handleChange}
      >
        <Tab label="Column types" {...a11yProps(0)} />
        <Tab label="Column properties" {...a11yProps(1)} />
        <Tab label="Cell entities" {...a11yProps(2)} />
      </Tabs>
      <Stack minHeight="600px">
        <TabPanel value={value} index={0}>
          <TypeTab addEdit={handleAddEdit} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PropertyTab addEdit={handleAddEdit} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <EntityTab addEdit={handleAddEdit} />
        </TabPanel>
      </Stack>
    </Stack>
  );
};

const MetadataColumnDialog: FC<DialogProps> = ({
  maxWidth = "lg",
  ...props
}) => {
  return (
    <Dialog maxWidth={maxWidth} {...props}>
      <Content />
    </Dialog>
  );
};

export default MetadataColumnDialog;
