import styled from "@emotion/styled";
import { useAppSelector } from "@hooks/store";
import { KeyboardArrowLeft, KeyboardArrowRight, ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  Typography,
  Collapse,
} from "@mui/material";
import { selectDiscoverStep } from "@store/slices/table/table.selectors";
import {
  FC,
  useState,
  FunctionComponent,
  useEffect,
  useMemo,
} from "react";
import { selectModifiersAsArray, selectReconciliatorsAsArray, selectExtendersAsArray } from "@store/slices/config/config.selectors";

const IndexButton = styled(Button, { shouldForwardProp: (prop) =>
    prop !== 'active' })(({ active }: { active?: boolean }) => ({
  textTransform: "none",
  justifyContent: "flex-start",
  fontWeight: active ? "bold" : "normal",
  backgroundColor: active ? "rgba(0, 0, 0, 0.04)" : "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

const List = styled.ul({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  listStyle: "disc",
});

const ListItemButton = styled(Button, { shouldForwardProp: (prop) =>
    prop !== 'active' })(({ active }: { active?: boolean }) => ({
  textTransform: "none",
  fontWeight: active ? "bold" : "normal",
  backgroundColor: active ? "rgba(0, 0, 0, 0.04)" : "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
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

type Step = {
  label: string;
  Description: FunctionComponent<{ goTo: (step: number) => void }>;
};

const DiscoverIndex: FC<{
  activeStep: number;
  onStepSelect: (step: number) => void;
  nestedData: Record<string, Record<string, any[]>>;
  macroOrder: string[];
}> = ({ activeStep, onStepSelect, nestedData, macroOrder }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Object.keys(nestedData).forEach((macro) => {
      Object.keys(nestedData[macro]).forEach((category) => {
        const services = nestedData[macro][category];
        const isCurrentStepInCategory = services.some((s) => s.stepIndex === activeStep);

        if (isCurrentStepInCategory) {
          setOpenCategories((prev) => ({
            ...prev,
            [category]: true,
          }));
        }
      });
    });
  }, [activeStep, nestedData]);

  let globalCategoryCounter = 2;

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <IndexContainer>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Discover Services
      </Typography>
      <Stack spacing={1}>
        <IndexButton active={activeStep === 1} onClick={() => onStepSelect(1)}>
          1. Introduction
        </IndexButton>

        {macroOrder.map((macro) => (
          <Box key={macro}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 'bold', color: 'text.secondary', pl: 1, mb: 1, display: 'block', textTransform: 'uppercase' }}
            >
              {macro}
            </Typography>

            <Stack spacing={1}>
              {nestedData[macro] && Object.keys(nestedData[macro]).map((category) => {
                const services = nestedData[macro][category];
                const isSingleItem = services.length === 1;
                const currentParentNumber = globalCategoryCounter++;
                const isOpen = openCategories[category] || false;
                const isAnyChildActive = services.some((s) => s.stepIndex === activeStep);

                if (isSingleItem) {
                  const item = services[0];
                  return (
                    <IndexButton
                      key={item.id}
                      active={activeStep === item.stepIndex}
                      onClick={() => onStepSelect(item.stepIndex)}
                    >
                      {`${currentParentNumber}. ${item.title}`}
                    </IndexButton>
                  );
                }

                return (
                  <Box key={category} spacing={1}>
                    <ListItemButton
                      onClick={() => toggleCategory(category)}
                      sx={{ fontWeight: isAnyChildActive ? 'bold' : 'normal' }}
                    >
                      <Typography variant="body2">
                        {`${currentParentNumber}. ${category}`}
                      </Typography>
                      {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </ListItemButton>

                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Stack spacing={1} sx={{ ml: 2, mt: 0.5, borderLeft: '1px solid rgba(0,0,0,0.08)' }}>
                        {services.map((item, idx) => (
                          <IndexButton
                            key={item.id}
                            sx={{ py: 0.5, fontSize: '0.85rem', pl: 2 }}
                            active={activeStep === item.stepIndex}
                            onClick={() => onStepSelect(item.stepIndex)}
                          >
                            {`${currentParentNumber}.${idx + 1} ${item.title}`}
                          </IndexButton>
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>
    </IndexContainer>
  );
};

const DiscoverStepper: FC<{ onDone: () => void; onBackToWelcome: () => void }> = ({ onDone, onBackToWelcome }) => {
  const discoverStep = useAppSelector(selectDiscoverStep);
  const [activeStep, setActiveStep] = useState(discoverStep);

  const modifiers = useAppSelector(selectModifiersAsArray);
  const reconcilers = useAppSelector(selectReconciliatorsAsArray);
  const extenders = useAppSelector(selectExtendersAsArray);

  const { steps, nestedData, macroOrder } = useMemo(() => {
    const order = ["For Modification", "For Reconciliation", "For Extension"];
    const data: Record<string, Record<string, any[]>> = {
      "For Modification": {},
      "For Reconciliation": {},
      "For Extension": {}
    };

    const allSteps: Step[] = [
      {
        label: "Discover Journey",
        Description: () => <Typography>Select a topic from the index on the left.</Typography>,
      },
      {
        label: "Introduction",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              Explore available services for the Modification, Reconciliation and Extension.
              <List>
                <li>
                  <b>Modifiers</b>: Responsible for applying transformation function to the column content (e.g.,
                  data cleaning or date formatting).
                </li>
                <li>
                  <b>Reconcilers</b>: responsible for aligning or enriching tabular data with semantic metadata. They
                  match entities from the dataset with corresponding entries from external or internal knowledge sources,
                  enabling semantic linking and enhanced interoperability.
                </li>
                <li>
                  <b>Extenders</b>: Responsible for adding complementary data or attributes to existing resources, by
                  fetching related information from external systems. They typically operate on columns that have
                  been previously reconciled, enriching them with new metadata or values.
                </li>
              </List>
            </Typography>
          </Stack>
        ),
      },
    ];

    const processServices = (services: any[], macroKey: string) => {
      const unique = services.filter((s, i, self) => i === self.findIndex((t) => t.id === s.id));

      unique.forEach((s) => {
        const [category, title] = s.name.split(":").map((str: string) => str.trim());
        if (!data[macroKey][category]) data[macroKey][category] = [];

        const currentStepIndex = allSteps.length;
        data[macroKey][category].push({ ...s, title: title || category, stepIndex: currentStepIndex });

        allSteps.push({
          label: s.name,
          Description: () => (
            <Stack gap="10px">
              <Typography dangerouslySetInnerHTML={{ __html: s.description }} />
            </Stack>
          ),
        });
      });
    };
    processServices(modifiers, "For Modification");
    processServices(reconcilers, "For Reconciliation");
    processServices(extenders, "For Extension");

    return { steps: allSteps, nestedData: data, macroOrder: order };
  }, [modifiers, reconcilers, extenders]);

  useEffect(() => {
    if (discoverStep > 0 && discoverStep < steps.length) setActiveStep(discoverStep);
  }, [discoverStep, steps.length]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) onDone();
    else setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 1) onBackToWelcome();
    else setActiveStep((prev) => Math.max(1, prev - 1));
  };

  const currentStep = steps[activeStep] || steps[0];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "600px" }}>
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <DiscoverIndex
          activeStep={activeStep}
          onStepSelect={setActiveStep}
          nestedData={nestedData}
          macroOrder={macroOrder}
        />
        <ContentContainer>
          <Typography variant="h6" mb={2}>{currentStep.label}</Typography>
          <Box><currentStep.Description goTo={setActiveStep} /></Box>
        </ContentContainer>
      </Box>
      <Box
        sx={{
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          p: 2,
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <Button size="small" onClick={handleBack}>
          <KeyboardArrowLeft />
          Back
        </Button>
        <Button size="small" onClick={handleNext}>
          {activeStep === steps.length - 1
            ? ("Done")
            : (
              <>
                Next
                <KeyboardArrowRight />
              </>
            )
          }
        </Button>
      </Box>
    </Box>
  );
};

export default DiscoverStepper;
