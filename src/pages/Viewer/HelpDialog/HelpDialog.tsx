import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { KeyboardArrowLeft, KeyboardArrowRight, ExpandMore, ExpandLess } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Stack,
  Typography,
  Collapse,
  Link,
} from "@mui/material";
import { setHelpStart, updateUI } from "@store/slices/table/table.slice";
import { selectTutorialStep, selectDiscoverStep } from "@store/slices/table/table.selectors";
import SettingsEthernetRoundedIcon from "@mui/icons-material/SettingsEthernetRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import {
  FC,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import { StatusBadge } from "@components/core";
import DiscoverStepper from "./DiscoverStepper";
import tableView from "../../../assets/table-view.png";
import rawView from "../../../assets/raw-view.png";
import graphView from "../../../assets/graph-view.png";
import globalActions from "../../../assets/global-actions.png";
import contextualActions from "../../../assets/contextual-actions.png";
import columnHeader from "../../../assets/column-header.png";
import manualReconciliation from "../../../assets/manual-reconciliation.gif";
import automaticAnnotation from "../../../assets/automatic-annotation.gif";
import entityMatchingRevision from "../../../assets/entity-matching-revision.gif";
import refineMatchingAutomatic from "../../../assets/refine-matching-automatic.gif";
import extension from "../../../assets/extension.gif";
import search from "../../../assets/search.gif";
import modification from "../../../assets/modification.gif";
import schemaAnnotation from "../../../assets/schema-annotation.gif";
import serviceReconciliation from "../../../assets/service-reconciliation.gif";
import generativeAi from "../../../assets/generative-ai.gif";

type HelpDialogProps = DialogProps;

const List = styled.ul({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  listStyle: "disc",
});

const SubList = styled.ul({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  listStyle: "circle",
  marginTop: "6px",
});

const Img = styled.img({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  borderRadius: "7px",
  maxHeight: "400px",
});

const ButtonText = styled.span({
  borderRadius: "6px",
  backgroundColor: "#ebebeb",
  padding: "3px 10px",
  margin: "0 6px",
  boxShadow: "inset 0 -2px #ebefff",
});

const IndexButton = styled(Button, { shouldForwardProp: (prop) =>
    prop !== 'active' })(({ active }: { active?: boolean }) => ({
  textTransform: "none",
  justifyContent: "flex-start",
  fontWeight: active ? "bold" : "normal",
  backgroundColor: active ? "rgba(0, 0, 0, 0.04)" : "transparent",
  textAlign: "left",
  alignItems: "flex-start",
  whiteSpace: "normal",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

const ListItemButton = styled(Button, { shouldForwardProp: (prop) =>
    prop !== 'active' })(({ active }: { active?: boolean }) => ({
  textTransform: "none",
  fontWeight: active ? "bold" : "normal",
  backgroundColor: active ? "rgba(0, 0, 0, 0.04)" : "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  marginTop: "8px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%"
}));

const IndexContainer = styled(Box)({
  padding: "16px",
  borderRight: "1px solid rgba(0, 0, 0, 0.12)",
  height: "auto",
  minWidth: "260px",
  overflowY: "auto",
}) as typeof Box;

const ContentContainer = styled(Box)({
  padding: "16px",
  height: "auto",
  width: "100%",
  overflow: "auto",
}) as typeof Box;

type TutorialNav = {
  goTo: (step: number) => void;
  goToByLabel: (chapterLabel: string, pageLabel: string) => void;
};

type Page = {
  label: string;
  hiddenInIndex?: boolean;
  Description: (props: TutorialNav) => ReactNode;
}

type Chapter = {
  label: string;
  pages: Page[];
}

const chapters: Chapter[] = [
  {
    label: "Introduction",
    pages: [
      {
        label: "Introduction",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              SemT-X is a framework that makes tabular data more informative by integrating it with external knowledge
              sources. It provides an intuitive interface (SemT-UI) to explore tables, manage annotations, and enrich
              data with additional context.
              <br />
              <br />
              In this tutorial, you will get an overview of the main components and features of SemT-UI, including the
              <b> Table Viewer</b>, as well as how the <b> enrichment process </b> works. This workflow allows you to
              enhance your data through three main steps:
              <List>
                <li>
                  <b>Modification: </b>
                  Applying transformation functions to selected columns—such as Date Formatter or Data Cleaning—to
                  ensure consistency.
                </li>
                <li>
                  <b>Reconciliation: </b>
                  Matching entities in your original data with entities in external datasets (e.g., Wikidata).
                </li>
                <li>
                  <b>Extension: </b>
                  Retrieving additional information from the target dataset using the reconciled entities.
                </li>
              </List>
              SemT-X supports each of these steps by providing integrated access to modification, reconciliation, and
              extension services, including those powered by Gen AI and LLMs to automate and refine these operations.
            </Typography>
          </Stack>
        ),
      },
    ],
  },
  {
    label: "Toolbar",
    pages: [
      {
        label: "Global Actions",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              The Toolbar provides quick access to global table actions and management features. It allows you to
              efficiently perform various actions that affect the entire table. Starting from the left, you can:
              <Box display="flex" justifyContent="center" my={1}>
                <Img src={globalActions} />
              </Box>
              <List>
                <li>
                  <b>Switch </b>
                  between different table views: Tabular, Raw JSON and Graph.
                </li>
                <li>
                  Perform a <b> compliance check </b> on the table.
                </li>
                <li>
                  Run an <b> automatic annotation </b> for the whole table.
                </li>
                <li>
                  <b>Export </b> the table in different formats: JSON, CSV, RDF, Python pipeline and Jupyter notebook pipeline.
                </li>
                <li>
                  <b>Save changes </b> to the server.
                </li>
                <li>
                  Open the <b> settings </b> panel.
                </li>
                <li>
                  Access this <b> tutorial</b>.
                </li>
              </List>
            </Typography>
          </Stack>
        ),
      },
      {
        label: "Visualization",
        Description: ({ goToByLabel, goTo }) => {
          const dispatch = useAppDispatch();
          return (
            <Stack gap="10px">
              <Typography component="div">
                SemT-UI offers several ways to visualize tabular data, depending on your specific task or the required
                level of detail. The available modes include:
                <List>
                  <li>
                    <b>Table view</b>
                    <br />
                    The default mode, which displays data in a structured tabular format. From here, you can directly
                    interact with cells, rows, and columns to apply filters, manage annotations, and perform enrichment
                    operations.
                    <Box display="flex" justifyContent="center" my={1}>
                      <Img src={tableView} />
                    </Box>
                    For a detailed explanation of table-based interactions, refer to Section {" "}
                    <Link
                      component="button"
                      underline="hover"
                      role="button"
                      sx={{ cursor: "pointer" }}
                      onClick={() => goToByLabel("Table Viewer", "Contextual Actions", goTo)}
                    >
                      <b>3. Table Viewer</b>
                    </Link>
                    {" "}of this tutorial.
                  </li>
                  <li>
                    <b>Raw view</b>
                    <br />
                    This mode exposes the underlying JSON representation of the table, including both column definitions
                    and row data:
                    <SubList>
                      <li>
                        <b>Columns: </b>
                        Each column (e.g., th0, th1) contains metadata, labels, and contextual information.
                      </li>
                      <li>
                        <b>Rows: </b>
                        Each row object uses column names as keys, with values representing the cell content,
                        associated labels, metadata, and contextual information.
                      </li>
                    </SubList>
                    You can expand or collapse these elements to inspect their structure, making this view ideal for
                    debugging or for those interested in the raw data model.
                    <Box display="flex" justifyContent="center" my={1}>
                      <Img src={rawView} />
                    </Box>
                  </li>
                  <li>
                    <b>Graph view</b>
                    <br />
                    This view maps the table as an interactive graph, where nodes represent columns and links show their
                    semantic relationships. It simplifies exploring the dataset's structure and helps you understand how
                    different columns are connected.
                    <Box display="flex" justifyContent="center" my={1}>
                      <Img src={graphView} />
                    </Box>
                    For a detailed explanation of graph-based interactions and features, refer to {" "}
                    <Link
                      component="button"
                      underline="hover"
                      role="button"
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        dispatch(updateUI({
                          openHelpDialog: false,
                          openGraphTutorialDialog: true,
                          tutorialStep: 1,
                        }));
                      }}
                    >
                      <b>Graph Visualization Tutorial</b>.
                    </Link>
                  </li>
                </List>
              </Typography>
            </Stack>
          );
        },
      },
      {
        label: "Compliance",
        Description: () => {
          const dispatch = useAppDispatch();
          return (
            <Stack gap="10px">
              <Typography component="div">
                This feature evaluates the current state of your table's compliance with different regulatory frameworks.
                <br /><br />
                Click on the <ButtonText>Compliance</ButtonText> button in the Toolbar and simply select one of the
                available compliance services. Currently, the system supports GDPR assessment, allowing you to determine
                if your data processing aligns with European privacy standards. For a detailed explanation,
                refer to {" "}
                <Link
                  component="button"
                  underline="hover"
                  role="button"
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    dispatch(
                      updateUI({
                        openHelpDialog: true,
                        helpStart: "discover",
                        discoverStep: 27,
                      })
                    );
                  }}
                >
                  <b>GDPR</b>
                </Link>.
                <br /><br />
                This is a long-running asynchronous process, allowing you to continue working on other tables. Once the
                task is completed, you will receive a notification via a pop-up in the bottom-left corner of the screen.
              </Typography>
            </Stack>
          );
        },
      },
      {
        label: "Automatic Annotation",
        Description: ({ goTo, goToByLabel }) => (
          <Stack gap="10px">
            <Typography component="div">
              This feature leverages semantic services to automatically annotate your data.
              You can apply automatic annotation at two different levels:
              <List>
                <li>
                  <b>Full table: </b>
                  Processes the entire table using a specific service like Alligator (Semantic Table Interpretation).
                  This is currently the primary method for full-scale interpretation. For further details, refer to Section{" "}
                  <Link
                    component="button"
                    underline="hover"
                    role="button"
                    sx={{ cursor: "pointer" }}
                    onClick={() => goToByLabel("Reconciliation", "Semantic Table Interpretation (Automatic)", goTo)}
                  >
                    <b>5.2 Semantic Table Interpretation</b>
                  </Link>
                  {" "}of this tutorial.
                </li>
                <li>
                  <b>Schema: </b>
                  Focuses exclusively on the table columns using a specific services, such as the Column Classifier.
                  To learn more, refer to Section{" "}
                  <Link
                    component="button"
                    underline="hover"
                    role="button"
                    sx={{ cursor: "pointer" }}
                    onClick={() => goToByLabel("Reconciliation", "Schema Annotation", goTo)}
                  >
                    <b>5.5 Schema Annotation</b>
                  </Link>
                  {" "}of this tutorial.
                </li>
              </List>
              Once the process is complete, the table updates automatically. For Full table annotation, cells are
              populated with predicted entities and metadata; for Schema annotation, columns are updated with Named
              Entity Recognition (NER) and kind classifications.
            </Typography>
          </Stack>
        ),
      },
      {
        label: "Export",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              SemT-UI allows you to export your data or workflows in various formats tailored to your needs.
              The available export options include:
              <List>
                <li>
                  <b>Table: </b>
                  Saves the data in standard formats such as CSV, JSON (W3C Compliant) and RDF.
                  <SubList>
                    <li>
                      For <b> CSV</b>, you can customize the delimiter, quote character, decimal separator, and choose whether
                      to include the header.
                    </li>
                    <li>
                      For <b> RDF</b>, you can specify the serialization format, @base URI, filtering threshold, and match value.
                    </li>
                  </SubList>
                </li>
                <li>
                  <b>Pipeline: </b>
                  Generates a Python script or a Jupyter Notebook that represents your current table workflow.
                  Note that pipelines require all changes to be saved to the server before they can be exported.
                </li>
              </List>
              Once you have configured and confirmed the parameters, the file will be automatically downloaded.
            </Typography>
          </Stack>
        ),
      },
    ],
  },
  {
    label: "Table Viewer",
    pages: [
      {
        label: "Contextual Actions",
        Description: ({ goToByLabel, goTo }) => (
          <Stack gap="10px">
            <Typography component="div">
              Located in the SubToolbar, these actions become active only when you select one or
              more table elements (cells, columns, or rows). Unlike global actions, they apply
              exclusively to your current selection and may require specific conditions.
              <Box display="flex" justifyContent="center" my={1}>
                <Img src={contextualActions} />
              </Box>
              The main contextual options include:
              <List>
                <li>
                  <b>Undo/Redo: </b>
                  Revert or re-apply specific changes, allowing you to experiment safely with different
                  annotations and transformations.
                </li>
                <li>
                  <b>Delete columns: </b>
                  Remove the selected columns from the table
                </li>
                <li>
                  <b>Manage metadata: </b>
                  View or edit metadata associated with the selected columns or cells.
                </li>
                <li>
                  <b>Refine matching: </b>
                  Part of the enrichment process. For more details, refer to Section{" "}
                  <Link
                    component="button"
                    underline="hover"
                    role="button"
                    sx={{ cursor: "pointer" }}
                    onClick={() => goToByLabel("Matching Revision", "Group of Cells Refinement", goTo)}
                  >
                    <b>6.3 Group of Cells Refinement</b>
                  </Link>
                  {" "}of this tutorial.
                </li>
                <li>
                  <b>Expand cell: </b>
                  Open a detailed view containing reconciled data and linked information.
                </li>
                <li>
                  <b>Expand header: </b>
                  Visualize semantic relationships between reconciled entities within the column header.
                </li>
                <li>
                  <b>Toggle dense/accessible view: </b>
                  Switch the display style of selected columns to improve readability or data density.
                </li>
                <li>
                  <b>Modification, Reconciliantion and Extension: </b>
                  Part of the enrichment process, covered later in this tutorial.
                </li>
                <li>
                  <b>Gen AI: </b>
                  Leverage Large Language Models to perform advanced operations on your selection, including automated
                  Modification, Reconciliantion and Extension tasks tailored to the table's context.
                </li>
              </List>
            </Typography>
          </Stack>
        ),
      },
      {
        label: "Search and Navigation",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              Located in the top-right corner of the SubToolbar, the search and filtering features allows you to
              quickly isolate specific data. You can filter the table based on:
              <List>
                <li><b>Cell labels</b></li>
                <li><b>Metadata names</b>: Canonical names of the reconciled entity, which might differ from the cell
                  labels (e.g., searching for the official entity name <i>"Umbro"</i> even if the cell is misspelled).</li>
                <li><b>Metadata types</b>: Semantic categories or classes assigned to the reconciled entity.</li>
              </List>
              The search bar provides real-time suggestions as you type, helping you locate entities or annotations faster.
              Matching cells are highlighted, while rows that do not meet the criteria are temporarily hidden from the view.
            </Typography>
            <Img src={search} />
          </Stack>
        ),
      },
      {
        label: "Filtering and Column Visibility",
        Description: ({ goToByLabel, goTo }) => (
          <Stack gap="10px">
            <Typography component="div">
              Manage your workspace by focusing on specific data subsets. Use the
              <FilterAltOutlinedIcon
                sx={{
                  margin: "0px 3px",
                  verticalAlign: "middle",
                }}
              />
              icon to filter rows based on their <i>reconciliation status</i>:
              <br />
            </Typography>
            <Stack gap="10px">
              <Stack direction="row">
                <StatusBadge
                  sx={{
                    marginTop: "6px",
                    marginRight: "16px",
                  }}
                  status="match-reconciliator"
                />
                <Typography component="div">
                  <b>High-confidence matches (Successful): </b> Rows where the service is certain of the entity assignment.
                </Typography>
              </Stack>
              <Stack direction="row">
                <StatusBadge
                  sx={{
                    marginTop: "6px",
                    marginRight: "16px",
                  }}
                  status="warn"
                />
                <Typography component="div">
                  <b>Uncertain matches (Uncertain): </b>
                  Rows that require manual review because the service found multiple candidates with similar scores.
                </Typography>
              </Stack>
              <Stack direction="row">
                <StatusBadge
                  sx={{
                    marginTop: "6px",
                    marginRight: "16px",
                  }}
                  status="miss"
                />
                <Typography component="div">
                  <b>High-confidence no matches (Unsuccessful): </b>
                  Rows where no suitable candidates were found above the confidence threshold.
                </Typography>
              </Stack>
            </Stack>
            <Typography component="div">
              For more details on the annotation symbols, please refer to Section{" "}
              <Link
                component="button"
                underline="hover"
                role="button"
                sx={{ cursor: "pointer" }}
                onClick={() => goToByLabel("Reconciliation", "Annotation Symbols", goTo)}
              >
                <b>5.5 Annotation Symbols</b>
              </Link>
              {" "}of this tutorial.
            </Typography>
            <Typography component="div">
              <br />
              Additionally, <b>toggle column visibility</b> using the
              <VisibilityIcon
                sx={{
                  margin: "0px 3px",
                  verticalAlign: "middle"
                }}
              />
              icon. This dynamic list updates automatically as columns are added or removed, allowing you
              to hide auxiliary metadata and focus on core information.
            </Typography>
          </Stack>
        ),
      },
      {
        label: "Column Header Actions",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              Each column header provides a set of actions to help you manage column efficiently:
              <Box display="flex" justifyContent="center" my={1}>
                <Img src={columnHeader} style={{ width: "40%" }} />
              </Box>
              <List>
                <li>
                  <b>Pin or unpin columns</b> to keep them fixed on the left side while scrolling through the table.
                </li>
                <li>
                  <b>Manage metadata</b> to view or edit metadata associated with the column.
                </li>
                <li>
                  <b>Drag and drop</b> to reorder columns freely and customize your layout.
                </li>
                <li>
                  <b>Resize columns</b> by manually dragging their edges. To restore default widths, the reset button
                  <RestartAltRoundedIcon
                    sx={{
                      margin: "0px 3px",
                      verticalAlign: "middle",
                    }}
                  />
                  appears in the SubToolbar only after resizing.
                </li>
                <li>
                  <b>Sort alphabetically</b> to arrange cell values in ascending or descending order.
                </li>
                <li>
                  <b>Sort by match score</b> to prioritize cells with fully reconciled entities or unmatched ones.
                </li>
              </List>
              Column headers also show the data <b> kind </b>, whether they contains entities or literal values, the
              <b> Reconciliation service </b> name, and the status indicating whether they were fully, partially,
              or not reconciled.
            </Typography>
          </Stack>
        ),
      },
    ],
  },
  {
    label: "Modification",
    pages: [
      {
        label: "Modification",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              In this initial step, you can prepare your data for the reconciliation and extension.
              Simply select one or more columns, click the <ButtonText> Modify </ButtonText> button in the Toolbar,
              and choose from the available transformation functions.
            </Typography>
            <Img src={modification} />
          </Stack>
        ),
      },
    ],
  },
  {
    label: "Reconciliation",
    pages: [
      {
        label: "Introduction",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              SemT-X gives you access to both manual and automatic entity reconciliation services to link cell labels
              (mentions) to entities in an external knowledge source:
              <List>
                <li>
                  <b>Automatic</b>: You can perform it at two different levels:
                  <SubList>
                    <li>
                      <b>Full Table with Semantic Table Interpretation: </b>
                      Automatically reconciles all cells and provides semantic annotations for column headers.
                    </li>
                    <li>
                      <b>Schema Annotation: </b>
                      Automatically identifies the data kind and assigns a Named Entity Recognition classification to
                      each column.
                    </li>
                  </SubList>
                </li>
                <li>
                  <b>Service-based</b>: You reconcile a specific column or cell by selecting a reconciliation service
                  from the available ones.
                </li>
                <li>
                  <b>Manual</b>: You manually search for and assign a specific entity to a cell without using an
                  automated service.
                </li>
              </List>
            </Typography>
          </Stack>
        ),
      },
      {
        label: "Semantic Table Interpretation (Automatic)",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              Click on the <ButtonText> Automatic Annotation </ButtonText> button in the Toolbar.
              Then, select "Full table" as target and "Semantic Table Interpretation (Alligator)" ad the method.
              <br /><br />
              This is a long-running asynchronous process, allowing you to continue working on other tables.
              Once the task is completed, you will receive a notification via a pop-up in the bottom-left corner of the screen.
            </Typography>
            <Img src={automaticAnnotation} />
          </Stack>
        ),
      },
      {
        label: "Service-based Reconciliation",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              Select a column or a set of cells and click the <ButtonText> Reconcile </ButtonText> button in the Toolbar.
              This allows you to choose a service group and a specific service to match cell labels (mentions)
              against a Knowledge Graph.
            </Typography>
            <Img src={serviceReconciliation} />
          </Stack>
        ),
      },
      {
        label: "Manual Reconciliation",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              If entity IDs for specific cells are known, you can manually reconcile them by simply clicking the
              <SettingsEthernetRoundedIcon
                sx={{
                  margin: "0px 3px",
                  verticalAlign: "middle",
                }}
              />
              icon of a cell.
              <br /><br />
              Choose the knowledege source prefix you want to use, fill in the required fields, and
              add the entity. You can then persist this match across the table by clicking the <ButtonText> Confirm and
              Propagate </ButtonText> button.
            </Typography>
            <Img src={manualReconciliation} />
          </Stack>
        ),
      },
      {
        label: "Schema Annotation",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              Simply click on the <ButtonText> Automatic Annotation </ButtonText> button in the Toolbar.
              Then, choose "Schema" as target and "Column Classifier" as method.
              <br /><br />
              This process automatically identifies the <b> Kind </b> of the column (e.g., whether it contains entities
              or literal values) and assigns a <b> NER Classification </b> based on the cell values:
              <List>
                <li>
                  <b>For entities: </b> It distinguishes between PERSON, LOCATION, ORGANIZATION, or OTHER;
                </li>
                <li>
                  <b>For literals: </b> It distinguishes between NUMBER, DATE, or STRING;
                </li>
              </List>
              This classification is crucial as it guides the system in suggesting only the most relevant Wikidata
              properties to your data type.
              <br /><br />
              Once the task is completed, you will receive a notification via a pop-up in the bottom-left corner of the screen.
            </Typography>
            <Img src={schemaAnnotation} />
          </Stack>
        ),
      },
      {
        label: "Annotation Symbols",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              The colors and shapes of the icons in front of reconciled entities provide
              visual feedback on the outcome of the reconciliation process:
            </Typography>
            <Stack gap="10px">
              <Stack direction="row">
                <StatusBadge
                  sx={{
                    marginTop: "6px",
                    marginRight: "16px",
                  }}
                  status="match-reconciliator"
                />
                <Typography component="div">
                  <b>Successful reconciliation:</b> The cell is annotated with an entity automatically assigned by the
                  <i> reconciliation service</i>.
                </Typography>
              </Stack>
              <Stack direction="row">
                <StatusBadge
                  sx={{
                    marginTop: "6px",
                    marginRight: "20px",
                  }}
                  status="match-refinement"
                />
                <Typography component="div">
                  <b>Successful reconciliation: </b> An entity has been assigned by the <i> column refinement feature</i>.
                </Typography>
              </Stack>
              <Stack direction="row">
                <StatusBadge
                  sx={{
                    marginTop: "6px",
                    marginRight: "16px",
                  }}
                  status="match-manual"
                />
                <Typography component="div">
                  <b>Successful reconciliation: </b> An entity has been <i> manually </i> assigned to the cell.
                </Typography>
              </Stack>
              <Stack direction="row">
                <StatusBadge
                  sx={{
                    marginTop: "6px",
                    marginRight: "16px",
                  }}
                  status="warn"
                />
                <Typography component="div">
                  <b>Uncertain reconciliation: </b> Candidate entities were found above the threshold, but none were
                  selected for the cell because multiple candidates have similar scores.
                </Typography>
              </Stack>
              <Stack direction="row">
                <StatusBadge
                  sx={{
                    marginTop: "6px",
                    marginRight: "16px",
                  }}
                  status="miss"
                />
                <Typography component="div">
                  <b>Unsuccessful reconciliation: </b> No candidate entities were found, or none scores reached the
                  required confidence threshold.
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        ),
      },
    ],
  },
  {
    label: "Matching Revision",
    pages: [
      {
        label: "Introduction",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              SemT-X supports two types of matching revision:
              <List>
                <li>
                  <b>Single Cell Entity Matching Revision: </b>
                  You can assign the <i> true </i> tag to one of the candidate entities for a single cell, or add
                  the correct entity manually. You can also optionally propagate the choice to all identical cells
                  in the same column.
                </li>
                <li>
                  <b>Group of Cells Refinement: </b>
                  You can select a column (or multiple cells within it) and refine the matching using the <i> Refine Matching </i>
                  feature.
                </li>
              </List>
            </Typography>
          </Stack>
        ),
      },
      {
        label: "Single Cell Entity Matching Revision",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              Once reconciliation is completed, you can review, correct and validate the results by inspecting the
              metadata associated with each cell.
              <br /><br />
              Click the
              <SettingsEthernetRoundedIcon
                sx={{
                  margin: "0px 3px",
                  verticalAlign: "middle",
                }}
              />
              icon to open the metadata view for a selected cell. Here, you can compare different candidates by viewing
              their types and select the correct entity from the list.
              <br /><br />
              If the correct entity is not among the candidates, you can search for it directly in the reference
              knowledge graph. Select the appropriate <i>prefix</i>, find the entity on the external provider's site,
              then copy and paste its URL into the dedicated field. After filling in the required metadata, click
              <ButtonText>Add</ButtonText>.
              <br /><br />
              You can then persist this match across the table by clicking the <ButtonText> Confirm and Propagate </ButtonText>
              button.
            </Typography>
            <Img src={entityMatchingRevision} />
          </Stack>
        ),
      },
      {
        label: "Group of Cells Refinement",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              The
              <PlaylistAddCheckRoundedIcon
                sx={{
                  margin: "0px 3px",
                  verticalAlign: "middle",
                }}
              />
              icon allows you to refine the matching for a group of cells simultaneously.
              First, select a column or a specific subset of its cells, then choose one of the following refinement methods:
              <List>
                <li>
                  <b>Type Refine Matching</b>: Filter and confirm entities by choosing from the specific semantic types
                  associated with the selected cells.
                </li>
                <li>
                  <b>Score Refine Matching</b>: Validate or reject matches by applying a confidence score threshold.
                </li>
              </List>
            </Typography>
            <Img src={refineMatchingAutomatic} />
          </Stack>
        ),
      },
    ],
  },
  {
    label: "Extension",
    pages: [
      {
        label: "Extension",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              Once a column has been reconciled, you can use its matched entities to extend the table with
              additional information from external sources.
              <br /><br />
              Simply select the reconciled column, click the <ButtonText>Extend</ButtonText> button in the Toolbar,
              and choose from the available extension services.
            </Typography>
            <Img src={extension} />
          </Stack>
        ),
      },
    ],
  },
  {
    label: "Generative AI",
    pages: [
      {
        label: "Generative AI",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              You can leverage Large Language Models (LLMs) to perform advanced operations on selected columns or cells.
              These services allow you to transform content, improve reconciliation, or extract new data
              from knowledge bases.
              <br /><br />
              Click the <b>Gen AI</b> button in the SubToolbar and choose the type of operation you wish to perform:
              <List>
                <li><b>Modification</b>: To transform or clean existing cell values.</li>
                <li><b>Reconciliation</b>: To link mentions to entities using AI-driven matching.</li>
                <li><b>Extension</b>: To generate new columns by extracting additional information.</li>
              </List>
              And then simply choose one of the available AI services to proceed.
            </Typography>
            <Img src={generativeAi} />
          </Stack>
        ),
      },
    ],
  },
  {
    label: "",
    pages: [
      {
        label: "",
        hiddenInIndex: true,
        Description: () => (
          <Stack
            sx={{
              height: "200px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h4">Tutorial completed!</Typography>
            <Typography>
              These are the core steps to start working with SemT-X.
              <br />
              Explore further to make the most of its features.
            </Typography>
          </Stack>
        ),
      },
    ],
  },
];

type FlatPage = {
  step: number;
  chapterIndex: number;
  pageIndex: number;
  chapterLabel: string;
  label: string;
  hiddenInIndex?: boolean;
  Description: Page["Description"];
};

const flatPages: FlatPage[] = chapters.flatMap((ch, ci) =>
  ch.pages.map((p, pi) => ({
    step: 0,
    chapterIndex: ci + 1,
    pageIndex: pi + 1,
    chapterLabel: ch.label,
    label: p.label,
    hiddenInIndex: p.hiddenInIndex,
    Description: p.Description,
  }))).map((p, idx) => ({ ...p, step: idx + 1 }));

// Tutorial Index component to display all tutorial sections
const TutorialIndex: FC<{
  activeStep: number;
  onStepSelect: (step: number) => void;
}> = ({ activeStep, onStepSelect }) => {
  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const active = flatPages.find((p) => p.step === activeStep);
    if (!active) return;
    setOpenChapters((prev) => ({ ...prev, [active.chapterIndex]: true }));
  }, [activeStep]);

  const toggleChapter = (chapterIndex: number) => {
    setOpenChapters((prev) => ({ ...prev, [chapterIndex]: !prev[chapterIndex] }));
  };

  return (
    <IndexContainer>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Tutorial Contents
      </Typography>
      <Stack spacing={1}>
        {chapters.map((ch, ci) => {
          const chapterIndex = ci + 1;
          const isOpen = !!openChapters[chapterIndex];

          const chapterPages = flatPages.filter(
            (p) => p.chapterIndex === chapterIndex && !p.hiddenInIndex
          );

          if (chapterPages.length === 0) return null;

          const hasMultiplePages = chapterPages.length > 1;
          const firstPage = chapterPages[0];

          return (
            <Stack key={`${chapterIndex}.${ch.label}`} spacing={1}>
              <ListItemButton
                onClick={() => {
                  if (hasMultiplePages) toggleChapter(chapterIndex);
                  else onStepSelect(firstPage.step);
                }}
              >
                <Box>{`${chapterIndex}. ${ch.label}`}</Box>
                {hasMultiplePages && (isOpen ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>

              {hasMultiplePages && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Stack spacing={1}>
                    {chapterPages.map((page) => (
                      <IndexButton
                        key={`${page.chapterLabel}.${page.label}.${page.step}`}
                        sx={{ pl: 3 }}
                        active={activeStep === page.step}
                        onClick={() => onStepSelect(page.step)}
                      >
                        {`${chapterIndex}.${page.pageIndex} ${page.label}`}
                      </IndexButton>
                    ))}
                  </Stack>
                </Collapse>
              )}
            </Stack>
          );
        })}
      </Stack>
    </IndexContainer>
  );
};

type TutorialStepProps = {
  label: string;
  Description: ReactNode;
};

const TutorialStep: FC<TutorialStepProps> = ({ label, Description }) => {
  return (
    <ContentContainer>
      <Typography variant="h6" mb={2}>
        {label}
      </Typography>
      <Box>{Description}</Box>
    </ContentContainer>
  );
};

type TutorialStepperProps = {
  onDone: () => void;
  onBackToWelcome: () => void;
};

const TutorialStepper: FC<TutorialStepperProps> = ({ onDone, onBackToWelcome }) => {
  const tutorialStep = useAppSelector(selectTutorialStep);
  const [activeStep, setActiveStep] = useState(1);
  const maxSteps = flatPages.length;

  useEffect(() => {
    // Set the active step from Redux when it changes
    if (tutorialStep > 0 && tutorialStep <= maxSteps) {
      setActiveStep(tutorialStep);
    }
  }, [tutorialStep, maxSteps]);

  const goTo = (step: number) => setActiveStep(step);

  const goToByLabel = (chapterLabel: string, pageLabel: string) => {
    const target = flatPages.find(
      (p) => p.chapterLabel === chapterLabel && p.label === pageLabel,
    );
    if (target) setActiveStep(target.step);
  };

  const handleNext = () => {
    if (activeStep === maxSteps) return onDone();
    setActiveStep((step) => step + 1);
  };

  const handleBack = () => {
    if (activeStep === 1) return onBackToWelcome();
    setActiveStep((step) => step - 1);
  };

  const activePage = flatPages.find((p) => p.step === activeStep) ?? flatPages[0];

  const visibleInChapter = flatPages.filter(
    (p) => p.chapterIndex === activePage.chapterIndex && !p.hiddenInIndex
  );
  const hasMultiplePages = visibleInChapter.length > 1;

  const headerLabel = activePage.hiddenInIndex
    ? activePage.label
    : hasMultiplePages
      ? `${activePage.chapterIndex}.${activePage.pageIndex} ${activePage.label}`
      : `${activePage.chapterIndex}. ${activePage.label}`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "600px" }}>
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <TutorialIndex
          activeStep={activeStep}
          onStepSelect={goTo}
        />
        <TutorialStep
          label={headerLabel}
          Description={<activePage.Description goTo={goTo} goToByLabel={goToByLabel} />}
        />
      </Box>
      <Box sx={{ borderTop: "1px solid rgba(0, 0, 0, 0.12)", p: 2, display: "flex", justifyContent: "space-between" }}>
        <Button size="small" onClick={handleBack}>
          <KeyboardArrowLeft />
          Back
        </Button>
        <Button size="small" onClick={handleNext}>
          {activeStep === maxSteps ? (
            "Done"
          ) : (
            <>
              Next
              <KeyboardArrowRight />
            </>
          )}
        </Button>
      </Box>
    </Box>
  );
};

const HelpDialog: FC<HelpDialogProps> = ({ onClose, ...props }) => {
  const start = useAppSelector((state) => state.table.ui.helpStart);
  const refWrapper = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const tutorialStep = useAppSelector(selectTutorialStep);
  const discoverStep = useAppSelector(selectDiscoverStep);

  const handleStart = (value: boolean | "tutorial" | "discover") => {
    dispatch(setHelpStart(value));
  };

  useEffect(() => {
    // If a specific tutorial step is set (greater than 1),
    // automatically start the tutorial
    if (discoverStep && discoverStep > 1) {
      handleStart("discover");
    } else if (tutorialStep && tutorialStep > 1) {
      handleStart("tutorial");
    } else {
      handleStart(false);
    }
  }, [tutorialStep, discoverStep]);

  const handleOnClose = (
    event: {},
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    dispatch(updateUI({ tutorialStep: 0, discoverStep: 0 }));
    handleStart(false);
    if (onClose) {
      onClose(event, reason);
    }
  };

  const handleOnDone = () => {
    dispatch(updateUI({ tutorialStep: 0, discoverStep: 0 }));
    handleStart(false);
  };

  return (
    <Dialog onClose={handleOnClose} maxWidth="md" fullWidth {...props}>
      <Box ref={refWrapper}>
        {!start ? (
          <>
            <DialogTitle
              sx={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              Welcome to SemTUI!
            </DialogTitle>
            <DialogContent>
              <Stack gap="10px">
                SemTUI is a framework for the semantic enrichment of tabular data.
                <br />
                It helps you enhance tables by linking cells and columns to external
                knowledge sources, adding context and extra information.
                <br />
                <Stack alignSelf="center" direction="row" gap="16px" marginTop="16px">
                  <Button
                    onClick={() => handleStart("tutorial")}
                    variant="outlined"
                  >
                    Start tutorial
                  </Button>
                  <Button
                    onClick={() => handleStart("discover")}
                    variant="outlined"
                  >
                    Discover services
                  </Button>
                  <Button
                    onClick={() => window.open("https://www.youtube.com/watch?v=XMfRQueX48M", "_blank")}
                    variant="outlined"
                  >
                    Video introduction
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        ) : (
          <DialogContent sx={{ p: 0 }}>
            {start === "discover" && <DiscoverStepper onDone={handleOnDone} onBackToWelcome={() => handleStart(false)} />}
            {start === "tutorial" && <TutorialStepper onDone={handleOnDone} onBackToWelcome={() => handleStart(false)} />}
          </DialogContent>
        )}
      </Box>
    </Dialog>
  );
};

export default HelpDialog;

/**
 * To open the help dialog with a specific tutorial section, dispatch the following Redux action:
 *
 * dispatch(updateUI({
 *   openHelpDialog: true,  // Open the dialog
 *   tutorialStep: n        // Show section n (1-10), where 1 is intro and 2-10 are tutorial sections
 * }));
 *
 * If tutorialStep is not specified or is set to 1, the welcome screen will be shown first.
 * If tutorialStep is set to a value from 2-10, the dialog will open directly to that tutorial section.
 */
