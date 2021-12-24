import styled from '@emotion/styled';
import { useAppDispatch } from '@hooks/store';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle, MobileStepper, Stack, Typography } from '@mui/material';
import { updateUI } from '@store/slices/table/table.slice';
import SettingsEthernetRoundedIcon from '@mui/icons-material/SettingsEthernetRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import { FC, useState, useRef, useEffect, useCallback, FunctionComponent, ReactNode } from 'react';
import { StatusBadge } from '@components/core';
import manualAnnotation from '../../../assets/manual-reconciliation.gif';
import automaticAnnotation from '../../../assets/automatic-annotation.gif';
import refineMatchingManual from '../../../assets/refine-matching-manual.gif';
import refineMatchingAutomatic from '../../../assets/refine-matching-automatic.gif';
import extension from '../../../assets/extension.gif';

type HelpDialogProps = DialogProps;

const List = styled.ul({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  listStyle: 'disc'
});

const Img = styled.img({
  width: '550px',
  height: '312px',
  borderRadius: '7px'
});

const ButtonText = styled.span({
  borderRadius: '6px',
  backgroundColor: '#f6f6f6',
  padding: '3px 4px',
  margin: '0 2px',
  boxShadow: 'inset 0 -2px #ebefff'
});

type Step = {
  label: string;
  Description: FunctionComponent<{ goTo: (step: number) => void }>;
};

const steps: Step[] = [
  {
    label: 'Tutorial journey',
    Description: ({ goTo }) => (
      <Stack alignItems="flex-start">
        <Button onClick={() => goTo(1)} sx={{ textTransform: 'none' }}>1. Introduction</Button>
        <Button onClick={() => goTo(2)} sx={{ textTransform: 'none' }}>2. Reconciliation</Button>
        <Button onClick={() => goTo(3)} sx={{ textTransform: 'none', marginLeft: '10px' }}>2.1 Manual Annotation</Button>
        <Button onClick={() => goTo(4)} sx={{ textTransform: 'none', marginLeft: '10px' }}>2.2 Automatic Annotation</Button>
        <Button onClick={() => goTo(5)} sx={{ textTransform: 'none', marginLeft: '10px' }}>2.3 Annotation Symbols</Button>
        <Button onClick={() => goTo(6)} sx={{ textTransform: 'none' }}>3. Matching Refinement</Button>
        <Button onClick={() => goTo(8)} sx={{ textTransform: 'none' }}>4. Extension</Button>
      </Stack>
    )
  },
  {
    label: 'The enrichment process',
    Description: () => (
      <Stack>
        The enrichment process is usually composed by two main task:
        <List>
          <li>
            <b>Reconciliation: </b>
            matching entities in the original
            data to a target dataset (e.g.: Wikidata, DBPedia, ...).
          </li>
          <li>
            <b>Extension: </b>
            fetch new information on the target dataset using the reconciliated entities
            to enrich the original data.
          </li>
        </List>
        SemTUI makes these steps easier for you so that you can refine end perfect your results
        of data enrichment.
      </Stack>
    )
  },
  {
    label: 'Reconciliation',
    Description: () => (
      <Stack>
        SemTUI offers two way to reconcile entities within your table:
        <List>
          <li>
            <b>Manual annotation: </b>
            you can use different kind of services available
            to reconcile the selected cells or columns
          </li>
          <li>
            <b>Automatic annotation: </b>
            automatically annotate your entire table with one click
          </li>
        </List>
      </Stack>
    )
  },
  {
    label: 'Manual annotation',
    Description: () => (
      <Stack gap="10px">
        <Typography>
          Select one or more cell to reconcile and click on the
          <ButtonText>Reconcile</ButtonText>
          button in the application
          toolbar. Multiple services are available for you to choose from.
        </Typography>
        <Img src={manualAnnotation} />
      </Stack>
    )
  },
  {
    label: 'Automatic annotation',
    Description: () => (
      <Stack gap="10px">
        <Typography>
          You can also choose to automatically annotate the whole table
          by pressing the
          <ButtonText>Automatic annotation</ButtonText>
          button in the top right corner. The process might take a while, but you are free
          to work on other tables. When the annotation process is done a notification will popup
          for you.
        </Typography>
        <Img src={automaticAnnotation} />
      </Stack>
    )
  },
  {
    label: 'Annotation symbols',
    Description: () => (
      <Stack gap="10px">
        <Typography>
          To help you understand the result of an annotation process some symbols
          will appear within annotated cells.
        </Typography>
        <Stack gap="10px">
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: '6px',
                marginRight: '6px'
              }}
              status="miss" />
            <Typography>
              : The cell is annotated, but the service did
              not successfully assign any metadata to it,
              or associated metadata have a score lower than
              the configured lower bound threshold.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: '6px',
                marginRight: '6px'
              }}
              status="warn" />
            <Typography>
              : The cell is annotated, but it does not have a matching metadata yet.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: '6px',
                marginRight: '6px'
              }}
              status="match-manual" />
            <Typography>
              : The cell is annotated and the matching metadata
              has been assigned manually by the user.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: '6px',
                marginRight: '6px'
              }}
              status="match-refinement" />
            <Typography>
              : The cell is annotated and the matching metadata has been
              assigned by the refinement feature.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: '6px',
                marginRight: '6px'
              }}
              status="match-reconciliator" />
            <Typography>
              : The cell is annotated and the matching metadata has been
              assigned automatically by the reconciliator service.
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    )
  },
  {
    label: 'Refine matching (1)',
    Description: () => (
      <Stack gap="10px">
        <Typography>
          Once the reconciliation process is done you will be able to refine your matching by
          inspecting metadata for each cell. You can click on the
          <SettingsEthernetRoundedIcon
            sx={{
              margin: '0px 3px',
              verticalAlign: 'middle'
            }}
          />
          to inspect metadata of a selected cell.
        </Typography>
        <Img src={refineMatchingManual} />
      </Stack>
    )
  },
  {
    label: 'Refine matching (2)',
    Description: () => (
      <Stack gap="10px">
        <Typography>
          You can also choose to refine matching based on
          the types present in the selected cells or columns. You can click on
          the
          <PlaylistAddCheckRoundedIcon
            sx={{
              margin: '0px 3px',
              verticalAlign: 'middle'
            }}
          />
          to access this functionality.
        </Typography>
        <Img src={refineMatchingAutomatic} />
      </Stack>
    )
  },
  {
    label: 'Extension',
    Description: () => (
      <Stack gap="10px">
        <Typography>
          Finally, once you have one or more column reconciliated you will be able
          to extend those by clicking the
          <ButtonText>Extend</ButtonText>
          button in the toolbar and choosing one of the available extension services.
        </Typography>
        <Img src={extension} />
      </Stack>
    )
  },
  {
    label: '',
    Description: () => (
      <Stack
        sx={{
          height: '200px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <Typography variant="h4">
          You are done!
        </Typography>
        <Typography>
          Those are the basics to work with SemTUI.
        </Typography>
      </Stack>
    )
  }
];

type TutorialStepProps = {
  label: string;
  Description: ReactNode;
}

const TutorialStep: FC<TutorialStepProps> = ({ label, Description, ...rest }) => {
  return (
    <>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {label}
      </DialogTitle>
      <DialogContent>
        <Box>
          {Description}
        </Box>
      </DialogContent>
    </>
  );
};

type TutorialStepperProps = {
  onStart: () => void;
  onDone: () => void;
}

const TutorialStepper: FC<TutorialStepperProps> = ({ onDone, onStart }) => {
  const [activeStep, setActiveStep] = useState(0);

  const maxSteps = steps.length;

  const handleNext = () => {
    if (activeStep === maxSteps - 1) {
      onDone();
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      onStart();
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const goTo = useCallback((step: number) => {
    setActiveStep(step);
  }, [setActiveStep]);

  const { label, Description } = steps[activeStep];

  return (
    <>
      <TutorialStep
        label={label}
        Description={<Description goTo={goTo} />} />
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
          <Button size="small" onClick={handleBack}>
            <KeyboardArrowLeft />
            Back
          </Button>
        )}
      />
    </>
  );
};

const HelpDialog: FC<HelpDialogProps> = ({
  onClose,
  ...props
}) => {
  const [start, setStart] = useState(false);
  const refWrapper = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();

  const handleOnClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    setStart(false);
    if (onClose) {
      onClose(event, reason);
    }
  };

  const handleOnStart = () => {
    setStart(false);
  };

  const handleOnDone = () => {
    setStart(false);
    dispatch(updateUI({ openHelpDialog: false }));
  };

  return (
    <Dialog
      onClose={handleOnClose}
      {...props}>
      <Box ref={refWrapper}>
        {!start ? (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Welcome to SemTUI!
            </DialogTitle>
            <DialogContent>
              <Stack gap="10px">
                SemTUI is a framework for semantic enrichment of tabular data.
                The enrichment task is the process of augmenting or
                extending some data with additional data from different external sources.
                <br />
                SemTUI tries to make the steps to enrich a table easier and affordable even to
                less experienced users.
                <Button
                  onClick={() => setStart(true)}
                  sx={{
                    alignSelf: 'center'
                  }}>
                  Start tutorial
                </Button>
              </Stack>
            </DialogContent>
          </>
        ) : (
          <TutorialStepper
            onDone={handleOnDone}
            onStart={handleOnStart} />
        )}
      </Box>
    </Dialog>
  );
};

export default HelpDialog;
