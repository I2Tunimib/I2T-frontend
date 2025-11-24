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
import { selectDiscoverRecStep } from "@store/slices/table/table.selectors";
import {
  FC,
  useState,
  useCallback,
  FunctionComponent,
  ReactNode,
  useEffect,
} from "react";
import { selectReconciliatorsAsArray } from "@store/slices/config/config.selectors";

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

const DiscoverRecIndex: FC<{
  activeStep: number;
  onStepSelect: (step: number) => void;
  categories: Record<string, { id: string; name: string; description: string; title: string }[]>;
  categoriesOrder: string[];
}> = ({ activeStep, onStepSelect, categories, categoriesOrder }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const flatServices: { service: { id: string; name: string; description: string; title: string }; step: number;
    categoryIndex: number; itemIndex: number }[] = [];
  let stepCounter = 2;

  categoriesOrder.forEach((category, catIndex) => {
    categories[category].forEach((item, idx) => {
      flatServices.push({ service: item, step: stepCounter, categoryIndex: catIndex, itemIndex: idx });
      stepCounter++;
    });
  });

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <IndexContainer>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Discover Reconcilers
      </Typography>
      <Stack spacing={1}>
        <IndexButton active={activeStep === 1} onClick={() => onStepSelect(1)}>
          1. Introduction
        </IndexButton>
        {categoriesOrder.map((category, catIndex) => {
          const isOpen = openCategories[category] || false;

          return (
            <Stack key={category} spacing={1}>
              <ListItemButton onClick={() => toggleCategory(category)}>
                <Box>{`${catIndex + 2}. ${category}`}</Box>
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Stack spacing={1}>
                  {categories[category].map((item, idx) => {
                    const flatItem = flatServices.find((f) => f.service.id === item.id);
                    const stepIndex = flatItem?.step ?? 0;

                    return (
                      <IndexButton
                        key={item.id}
                        sx={{ pl: 2 }}
                        active={activeStep === stepIndex}
                        onClick={() => onStepSelect(stepIndex)}
                      >
                        {`${catIndex + 2}.${idx + 1} ${item.title}`}
                      </IndexButton>
                    );
                  })}
                </Stack>
              </Collapse>
            </Stack>
          );
        })}
      </Stack>
    </IndexContainer>
  );
};

type DiscoverRecStepProps = {
  label: string;
  Description: ReactNode;
};

const DiscoverRecStep: FC<DiscoverRecStepProps> = ({ label, Description }) => {
  return (
    <ContentContainer>
      <Typography variant="h6" mb={2}>
        {label}
      </Typography>
      <Box>{Description}</Box>
    </ContentContainer>
  );
};

type DiscoverRecStepperProps = {
  onDone: () => void;
  onBackToWelcome: () => void;
};

const DiscoverRecStepper: FC<DiscoverRecStepperProps> = ({ onDone, onBackToWelcome }) => {
  const discoverRecStep = useAppSelector(selectDiscoverRecStep);
  const [activeStep, setActiveStep] = useState(discoverRecStep);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const uniqueReconciliators = reconciliators.filter(
    (reconciler, index, self) => index === self.findIndex((recon) => recon.id === reconciler.id),
  );

  const categories = uniqueReconciliators.reduce<Record<string, { id: string; name: string; description: string; title: string }[]>>((acc, service) => {
    const [category, title] = service.name.split(":").map((s) => s.trim());
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ...service, title: title || category });
    return acc;
  }, {});

  const categoriesOrder = Object.keys(categories);

  let stepCounter = 2;
  const steps: Step[] = [
    {
      label: "Discover reconcilers journey",
      Description: () => <Typography>Select a topic from the index on the left side.</Typography>,
    },
    {
      label: "Introduction",
      Description: () => (
        <Typography>
          Reconcilers are services responsible for aligning or enriching tabular data with semantic metadata. They
          achieve this by matching entities from the dataset with corresponding entries from external or internal
          knowledge sources, enabling semantic linking and enhanced interoperability.
        </Typography>
      ),
    },
  ];

  categoriesOrder.forEach((category) => {
    categories[category].forEach((service) => {
      steps.push({
        label: service.name,
        Description: () => (
          <Stack gap="10px">
            <Typography dangerouslySetInnerHTML={{ __html: service.description }} />
          </Stack>
        ),
      });
      stepCounter++;
    });
  });

  useEffect(() => {
    // Set the active step from Redux when it changes
    if (discoverRecStep > 0 && discoverRecStep < steps.length) {
      setActiveStep(discoverRecStep);
    }
  }, [discoverRecStep]);

  const maxSteps = steps.length;

  const handleNext = () => {
    if (activeStep === maxSteps - 1) {
      onDone();
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 1) {
      onBackToWelcome();
    } else {
      setActiveStep((prevActiveStep) => Math.max(1, prevActiveStep - 1));
    }
  };

  const handleStepSelect = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const { label, Description } = steps[activeStep];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "600px" }}>
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <DiscoverRecIndex
          activeStep={activeStep}
          onStepSelect={handleStepSelect}
          categories={categories}
          categoriesOrder={categoriesOrder}
        />
        <DiscoverRecStep
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

export default DiscoverRecStepper;
