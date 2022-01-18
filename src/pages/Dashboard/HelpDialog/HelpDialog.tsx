import { useAppDispatch } from '@hooks/store';
import { Box, Button, Dialog, DialogContent, DialogProps, DialogTitle, MobileStepper, Stack, Typography } from '@mui/material';
import { FC, FunctionComponent, ReactNode, useCallback, useState } from 'react';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { updateUI } from '@store/slices/table/table.slice';

const steps = [
  {
    label: 'Upload a dataset',
    description: `To start using SemTUI, you first have to upload a dataset. 
                  A dataset is a set of tables. The dataset has to be a zip file containing one or more tables.
                  The currently available supported table formats are CSV, JSON and W3C-JSON.`
  },
  {
    label: 'Upload a table',
    description:
      `You can also upload a new table to an existing dataset. Select a dataset and upload a table in one of the supported formats CSV, JSON and W3C-JSON.
      This time the table must not be uploaded as a zip file.`
  }
];

type StepProps = {
  label: string;
  description: string;
}

const Step: FC<StepProps> = ({ label, description, ...rest }) => {
  return (
    <>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {label}
      </DialogTitle>
      <DialogContent>
        <Box>
          {description}
        </Box>
      </DialogContent>
    </>
  );
};

const HelpDialog: FC<DialogProps> = ({
  onClose,
  ...props
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const maxSteps = steps.length;

  const dispatch = useAppDispatch();

  const handleOnClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    setActiveStep(0);
    if (onClose) {
      onClose(event, reason);
    }
  };

  const handleNext = () => {
    if (activeStep === maxSteps - 1) {
      setActiveStep(0);
      if (onClose) {
        onClose({}, 'backdropClick');
      }
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const { label, description } = steps[activeStep];

  return (
    <Dialog
      onClose={handleOnClose}
      {...props}>
      <Step
        label={label}
        description={description} />
      <MobileStepper
        variant="dots"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={(
          <Button
            size="small"
            onClick={handleNext}>
            {activeStep === maxSteps - 1 ? 'Done' : (
              <>
                Next
                <KeyboardArrowRight />
              </>
            )}
          </Button>
        )}
        backButton={(
          <Button disabled={activeStep === 0} size="small" onClick={handleBack}>
            <KeyboardArrowLeft />
            Back
          </Button>
        )}
      />
    </Dialog>
  );
};

export default HelpDialog;
