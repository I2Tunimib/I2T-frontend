import styled from "@emotion/styled";
import { useAppSelector } from "@hooks/store";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { selectDiscoverExtStep } from "@store/slices/table/table.selectors";
import {
  FC,
  useState,
  useCallback,
  FunctionComponent,
  ReactNode,
  useEffect,
} from "react";
import { selectExtendersAsArray } from "@store/slices/config/config.selectors";

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

const DiscoverExtIndex: FC<{
  activeStep: number;
  onStepSelect: (step: number) => void;
  extenders:  Record<string, { id: string; name: string; description: string; title: string }[]>;
}> = ({ activeStep, onStepSelect, extenders }) => {
  return (
    <IndexContainer>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Discover Extenders
      </Typography>
      <Stack spacing={1}>
        <IndexButton active={activeStep === 1} onClick={() => onStepSelect(1)}>
          1. Introduction
        </IndexButton>
        {extenders.map((extender, index) => {
          return (
            <IndexButton
              key={extender.id}
              active={activeStep === index + 2}
              onClick={() => onStepSelect(index + 2)}
            >
              {index + 2}. {extender.name}
            </IndexButton>
          );
        })}
      </Stack>
    </IndexContainer>
  );
};

type DiscoverExtStepProps = {
  label: string;
  Description: ReactNode;
};

const DiscoverExtStep: FC<DiscoverExtStepProps> = ({ label, Description }) => {
  return (
    <ContentContainer>
      <Typography variant="h6" mb={2}>
        {label}
      </Typography>
      <Box>{Description}</Box>
    </ContentContainer>
  );
};

type DiscoverExtStepperProps = {
  onDone: () => void;
  onBackToWelcome: () => void;
};

const DiscoverExtStepper: FC<DiscoverExtStepperProps> = ({ onDone, onBackToWelcome }) => {
  const discoverExtStep = useAppSelector(selectDiscoverExtStep);
  const [activeStep, setActiveStep] = useState(discoverExtStep);
  const extenders = useAppSelector(selectExtendersAsArray);
  const uniqueExtenders = extenders.filter(
    (extender, index, self) => index === self.findIndex((ext) => ext.id === extender.id),
  );

  const steps: Step[] = [
    {
      label: "Discover extenders journey",
      Description: () => (
        <Typography>Select a topic from the index on the left side.</Typography>
      ),
    },
    {
      label: "Introduction",
      Description: () => (
        <Typography>
          Services that add complementary data or attributes to existing resources by fetching related information
          from external systems. Extenders typically operate on columns that have been previously reconciled, enriching
          them with new metadata or values.
        </Typography>
      ),
    },
    ...uniqueExtenders.map((ext) => ({
      label: ext.name,
      Description: () => (
        <Stack gap="10px">
          <Typography dangerouslySetInnerHTML={{ __html: ext.description }} />
        </Stack>
      ),
    })),
  ];

  useEffect(() => {
    // Set the active step from Redux when it changes
    if (discoverExtStep > 0 && discoverExtStep < steps.length) {
      setActiveStep(discoverExtStep);
    }
  }, [discoverExtStep]);

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
        <DiscoverExtIndex
          activeStep={activeStep}
          onStepSelect={handleStepSelect}
          extenders={uniqueExtenders}
        />
        <DiscoverExtStep
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

export default DiscoverExtStepper;
