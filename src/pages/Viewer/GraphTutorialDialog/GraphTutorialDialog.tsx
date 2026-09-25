import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { setGraphTutorialStart } from "@store/slices/table/table.slice";
import { selectTutorialStep } from "@store/slices/table/table.selectors";
import {
  FC,
  useState,
  useRef,
  useCallback,
  FunctionComponent,
  ReactNode,
  useEffect,
} from "react";
import graphView from "../../../assets/graph-view.png";
import graphDefault from "../../../assets/graph-default.png";
import graphCompliance from "../../../assets/graph-compliance.png";
import totalElements from "../../../assets/total-elements.png";
import metrics from "../../../assets/metrics.png";
import node from "../../../assets/node.png";
import link from "../../../assets/link.png";
import suggestion from "../../../assets/suggestion.png";
import columnValues from "../../../assets/column-values.png";
import complianceSummary from "../../../assets/compliance-summary.png";
import styles from './GraphTutorialDialog.module.scss';

type GraphTutorialDialogProps = DialogProps;

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
  maxHeight: "400px",
});

const ButtonText = styled.span({
  borderRadius: "6px",
  backgroundColor: "#ebebeb",
  padding: "3px 10px",
  margin: "0 6px",
  boxShadow: "inset 0 -2px #ebefff",
});

const IndexButton = styled(Button, { shouldForwardProp: (prop) => prop !== 'active' })(({ active }: { active?: boolean }) => ({
  textTransform: "none",
  justifyContent: "flex-start",
  fontWeight: active ? "bold" : "normal",
  backgroundColor: active ? "rgba(0, 0, 0, 0.04)" : "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

const IndexContainer = styled(Box)({
  padding: "16px",
  borderRight: "1px solid rgba(0, 0, 0, 0.12)",
  height: "auto",
  minWidth: "250px",
  overflowY: "auto",
}) as typeof Box;

const ContentContainer = styled(Box)({
  padding: "16px",
  height: "auto",
  width: "100%",
  overflow: "auto",
}) as typeof Box;

type Step = {
  label: string;
  Description: FunctionComponent<{ goTo: (step: number) => void }>;
};

const steps: Step[] = [
  {
    label: "Tutorial journey",
    Description: () => (
      <Typography>Select a topic from the index on the left side.</Typography>
    ),
  },
  {
    label: "Introduction",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          In this tutorial, you will learn how to use the
          <b> Graph Viewer and its main features</b>
          .
          <br />
          This Viewer allows to explore the semantic structure of a dataset as an interactive graph, examining nodes
          (columns) and links, which represent relationships between them.
          <br />
          <br />
          The interface is divided into several key sections:
          <List>
            <li>
              <b>Graph area: </b>
              visualizes nodes and links.
            </li>
            <li>
              <b>Sidebar: </b>
              provides detailed information about the graph and selected elements.
            </li>
            <li>
              <b>Column values: </b>
              shows the data contained in a selected node (table column).
            </li>
          </List>
        </Typography>
        <Box display="flex" justifyContent="center" my={1}>
          <Img src={graphView} style={{ width: "100%" }} />
        </Box>
      </Stack>
    ),
  },
  {
    label: "Graph Area",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          The Graph Area supports two visualization modes, toggled via the buttons in the top right corner:
          <List>
            <li>
              <b>Standard View: </b>
              The default mode, where node colors are determined by their basic semantic role.
              <Stack direction="column" spacing={1} sx={{ marginTop: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <div className={styles.Subject} />
                  <span>
                    <b>Subject: </b>
                    main entities or key columns in the dataset.
                  </span>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <div className={styles.Entity} />
                  <span>
                    <b>Entity: </b>
                    related objects or semantic concepts connected to Subjects.
                  </span>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <div className={styles.Literal} />
                  <span>
                    <b>Literal: </b>
                    concrete values from the table (like strings, numbers, or dates).
                  </span>
                </Stack>
              </Stack>
              <Box display="flex" justifyContent="center" my={1}>
                <Img src={graphDefault} />
              </Box>
            </li>
            <li>
              <b>Compliance View: </b>
              Activated by clicking the <ButtonText> Show compliance </ButtonText> button. In this mode, node colors are determined by their
              data privacy classification.
              <Stack direction="column" spacing={1} sx={{ marginTop: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <div className={styles.Personal} />
                  <span>
                    <b>Personal Data: </b>
                    Directly identifies an individual (e.g., name, email)
                  </span>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <div className={styles.QuasiIdentifiers} />
                  <span>
                    <b>Quasi-Identifiers: </b>
                    Could indirectly identify a person when combined with other data.
                  </span>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <div className={styles.NonPersonal} />
                  <span>
                    <b>Non-Personal Data: </b>
                    Organizational or contextual information.
                  </span>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <div className={styles.Anonymous} />
                  <span>
                    <b>Anonymous Data: </b>
                    Fully anonymized data.
                  </span>
                </Stack>
              </Stack>
              <Box display="flex" justifyContent="center" my={1}>
                <Img src={graphCompliance} />
              </Box>
            </li>
          </List>
          <br />
          You can explore and interact with the graph using the following actions:
          <List>
            <li>
              Hover over a node to display its metadata.
            </li>
            <li>
              Hover over a link to show its property and label.
            </li>
            <li>
              Hide/Show link label to toggle between viewing just the property or both the property and the label when hovering over a link by clicking on the respective button in the top right.
            </li>
            <li>
              Select a node to view its detailed information in the Sidebar and the corresponding data in the Column Values section.
            </li>
            <li>
              Select a link to view its detailed information in the Sidebar.
            </li>
            <li>
              Show/Hide compliance information to toggle between viewing the default schema and the one integrated with compliance status and classification by clicking on the respective button in the top right.
            </li>
          </List>
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Sidebar",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          The Sidebar is divided into two main sections:
          <List>
            <li>
              <b>Fixed section: </b>
              Shows general information about the graph, like the total number of nodes and links, and some useful metrics.
            </li>
            <li>
              <b>Dynamic section: </b>
              Displays details of the currently selected node or link. Selecting an element in the graph updates this
              part automatically.
            </li>
          </List>
          These two sections allow users to analyze the overall graph structure and inspect specific elements interactively.
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Graph info",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          This fixed section displays general information about the entire graph:
          <List>
            <li>
              <b>Total Nodes: </b>
              Number of nodes in the graph.
              <br />
              <ButtonText>Show list</ButtonText>
              displays all nodes with their type (Subject, Entity, Literal).
            </li>
            <li>
              <b>Total Links: </b>
              Number of edges connecting nodes.
              <br />
              <ButtonText>Show list</ButtonText>
              displays all links with their property and label.
            </li>
            <li>
              <b>Graph Metrics: </b>
              Some key metrics help analyze the graph structure semantically, such as density for
              spotting missing relations or sparse datasets, max degree to identify the node with the most connections,
              which corresponds with the frequently referenced entity, and so on.
            </li>
          </List>
        </Typography>
        <Box display="flex" justifyContent="center" my={1}>
          <Stack direction="row" gap="10px" alignItems="center">
            <Img src={totalElements} />
            <Img src={metrics} />
          </Stack>
        </Box>
        <br />
        <br />
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
          Compliance Summary
        </Typography>
        <Typography>
          When compliance is enabled, this section provides an overview of the dataset's privacy status:
          <List>
            <li>
              <b>Status: </b>
              Indicates whether the data is GDPR compliant or not, only if a compliance check has been performed.
            </li>
            <li>
              <b>Confidence score: </b>
              A percentage reflecting the reliability of the classification.
            </li>
            <li>
              <b>Reasoning: </b>
              A detailed explanation of the findings, including which data types (e.g., personal, quasi-identifiers) were detected and why.
            </li>
          </List>
        </Typography>
        <Box display="flex" justifyContent="center" my={1}>
          <Img src={complianceSummary} style={{ width: "40%" }} />
        </Box>
      </Stack>
    ),
  },
  {
    label: "Selected Node/Link Details",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          The second part of the Sidebar is dynamic and updates according to the element selected in the graph.
          After selecting an element, this section can be collapsed using the
          <ButtonText> - </ButtonText>
          button, allowing you to hide the details and focus on the graph general informations when needed.
          <br />
          When an element is selected, the Sidebar shows contextual information:
          <List>
            <li>
              <b>Selected Node: </b>
              Displays semantic details about the node, including:
              <SubList>
                <li>
                  <b>Compliance info: </b>
                  Summarizes the data classification and its compliance status along with the
                  confidence score. Only visible when <ButtonText>Show compliance</ButtonText> button is active.
                  If no check has been performed, the status is marked as <i>Not performed</i>.
                </li>
                <li>
                  <b>Kind and role: </b>
                  describing its function in the graph
                </li>
                <li>
                  <b>Types: </b>
                  representing its semantic classification
                </li>
                <li>
                  <b>Incoming and outgoing connections: </b>
                  showing how the node is related to others in the graph
                </li>
              </SubList>
            </li>
            <li>
              <b>Selected Link: </b>
              Displays information about the relationship between two nodes, including:
              <SubList>
                <li>
                  <b>Metadata Property: </b>
                  defines the relationship
                </li>
                <li>
                  <b>Source and Target nodes: </b>
                  For each endpoint, the associated types, which can be expanded to inspect their semantic meaning
                </li>
              </SubList>
            </li>
          </List>
          <Box display="flex" justifyContent="center" my={1}>
            <Stack direction="row" gap="10px" alignItems="center">
              <Img src={node} />
              <Img src={link} />
            </Stack>
          </Box>
          This dynamic view helps you understand both the structure of the graph and the semantics behind each
          connection, directly from the Sidebar.
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Column Values",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          Located at the bottom left of the Graph Area, this section is tightly connected to node selection.
          <br />
          Initially, the area displays a
          <b> suggestion </b>
          inviting the user to select a graph element.
          Once a node is selected, the table updates automatically to display the values of the corresponding column.
          <Box display="flex" justifyContent="center" my={1}>
            <Img src={suggestion} style={{ width: "40%" }} />
          </Box>
          This view allows you to:
          <List>
            <li>
              Inspect the
              <b> actual data values </b>
              associated with a semantic node, scrolling through the table.
            </li>
            <li>
              Check the
              <b> kind, semantic class for entities or datatype for literals, role and types </b>
              of a node by observing its content.
            </li>
            <li>
              Identify patterns, repetitions, missing values, or inconsistencies in the data.
            </li>
          </List>
          <Box display="flex" justifyContent="center" my={1}>
            <Img src={columnValues} style={{ width: "40%" }} />
          </Box>
          The Column Values table acts as a bridge between the graph representation and the
          concrete data stored in the dataset, supporting both semantic analysis and data quality inspection.
          <br />
          This section can be collapsed or expanded using the <ButtonText>+</ButtonText> and <ButtonText>-</ButtonText> buttons
          in the top right of the panel. When collapsed, it allows for more space to view the graph.
        </Typography>
      </Stack>
    ),
  },
];

// Tutorial Index component to display all tutorial sections
const TutorialIndex: FC<{
  activeStep: number;
  onStepSelect: (step: number) => void;
}> = ({ activeStep, onStepSelect }) => {
  return (
    <IndexContainer>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Tutorial Contents
      </Typography>
      <Stack spacing={1}>
        <IndexButton active={activeStep === 1} onClick={() => onStepSelect(1)}>
          1. Introduction
        </IndexButton>
        <IndexButton active={activeStep === 2} onClick={() => onStepSelect(2)}>
          2. Graph Area
        </IndexButton>
        <IndexButton active={activeStep === 3} onClick={() => onStepSelect(3)}>
          3. Sidebar
        </IndexButton>
        <IndexButton active={activeStep === 4} onClick={() => onStepSelect(4)} sx={{ pl: 3 }}>
          3.1 Graph Info
        </IndexButton>
        <IndexButton active={activeStep === 5} onClick={() => onStepSelect(5)} sx={{ pl: 3 }}>
          3.2 Selected Node/Link Details
        </IndexButton>
        <IndexButton active={activeStep === 6} onClick={() => onStepSelect(6)}>
          4. Column Values
        </IndexButton>
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
};

const TutorialStepper: FC<TutorialStepperProps> = ({ onDone }) => {
  const tutorialStep = useAppSelector(selectTutorialStep);
  const [activeStep, setActiveStep] = useState(tutorialStep);

  useEffect(() => {
    // Set the active step from Redux when it changes
    if (tutorialStep > 0 && tutorialStep < steps.length) {
      setActiveStep(tutorialStep);
    }
  }, [tutorialStep]);

  const maxSteps = steps.length;

  const handleNext = () => {
    if (activeStep === maxSteps - 1) {
      onDone();
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => Math.max(1, prevActiveStep - 1));
  };

  const handleStepSelect = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const { label, Description } = steps[activeStep];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "600px" }}>
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <TutorialIndex
          activeStep={activeStep}
          onStepSelect={handleStepSelect}
        />
        <TutorialStep
          label={label}
          Description={<Description goTo={handleStepSelect} />}
        />
      </Box>
      <Box
        sx={{
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button size="small" onClick={handleBack}>
          <KeyboardArrowLeft />
          Back
        </Button>
        <Button size="small" onClick={handleNext}>
          {activeStep === maxSteps - 1 ? (
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

const GraphTutorialDialog: FC<GraphTutorialDialogProps> = ({ onClose, ...props }) => {
  const start = useAppSelector((state) => state.table.ui.graphTutorialStart);
  const refWrapper = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const tutorialStep = useAppSelector(selectTutorialStep);

  const handleStart = (value: boolean) => {
    dispatch(setGraphTutorialStart(value));
  };

  useEffect(() => {
    // If a specific tutorial step is set (greater than 1),
    // automatically start the tutorial
    if (tutorialStep && tutorialStep > 1) {
      handleStart(true);
    } else {
      handleStart(false); // welcome
    }
  }, [tutorialStep, dispatch]);

  const handleOnClose = (
    event: {},
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    handleStart(false);
    if (onClose) {
      onClose(event, reason);
    }
  };

  const handleOnDone = () => {
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
              Graph Visualization
            </DialogTitle>
            <DialogContent>
              <Stack gap="10px">
                Explore the semantic structure of a table as a network of nodes and links to discover key columns,
                highly connected entities, and relationships that enrich data semantically.
                <Stack alignSelf="center" direction="row" gap="16px" marginTop="16px">
                  <Button
                    onClick={() => handleStart(true)}
                    variant="outlined"
                  >
                    Start tutorial
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        ) : (
          <DialogContent sx={{ p: 0 }}>
            <TutorialStepper onDone={handleOnDone} />
          </DialogContent>
        )}
      </Box>
    </Dialog>
  );
};

export default GraphTutorialDialog;
