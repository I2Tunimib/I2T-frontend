import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Alert,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import {
  forwardRef,
  Ref,
  ReactElement,
  useState,
  useEffect,
  FC
} from 'react';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { selectAreCellReconciliated, selectExtendRequestStatus } from '@store/slices/table/table.selectors';
import { updateUI } from '@store/slices/table/table.slice';
import { selectExtendersAsArray } from '@store/slices/config/config.selectors';
import { Extender } from '@store/slices/config/interfaces/config';
import styled from '@emotion/styled';
import { extend } from '@store/slices/table/table.thunk';
import { useSnackbar } from 'notistack';
import { SquaredBox } from '@components/core';
import DynamicForm from '@components/core/DynamicForm/DynamicForm';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const Content = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
});

const DialogInnerContent = () => {
  const [currentService, setCurrentService] = useState<Extender>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const extensionServices = useAppSelector(selectExtendersAsArray);
  const cellReconciliated = useAppSelector(selectAreCellReconciliated);
  const { loading } = useAppSelector(selectExtendRequestStatus);

  useEffect(() => {
    if (extensionServices && extensionServices.length > 0) {
      setCurrentService(extensionServices[0]);
    }
  }, [extensionServices]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const val = extensionServices.find((service) => service.id === event.target.value);
    if (val) {
      setCurrentService(val);
    }
  };

  const handleSubmit = (formState: Record<string, any>) => {
    if (currentService) {
      dispatch(extend({
        extender: currentService,
        formValues: formState
      })).unwrap()
        .then(({ data }) => {
          dispatch(updateUI({ openExtensionDialog: false }));
          const nColumns = Object.keys(data.columns).length;
          const infoText = `${nColumns} ${nColumns > 1 ? 'columns' : 'column'} added`;
          enqueueSnackbar(
            infoText,
            {
              autoHideDuration: 3000,
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center'
              }
            }
          );
        });
    }
  };

  return (
    <>
      {currentService && (
        <>
          <FormControl className="field">
            <Select
              value={currentService.id}
              onChange={(e) => handleChange(e)}
              variant="outlined"
            >
              {extensionServices && extensionServices.map((extender) => (
                <MenuItem key={extender.id} value={extender.id}>
                  {extender.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <SquaredBox dangerouslySetInnerHTML={{ __html: currentService.description }} />
          {!cellReconciliated && (
            <Alert severity="warning">
              The selected column does not have reconciliated cells,
              the result of the extension will be
              <b> null</b>
            </Alert>
          )}
          {currentService.formSchema && (
            <>
              <Divider />
              <DynamicForm
                service={currentService}
                loading={loading}
                onCancel={() => dispatch(updateUI({ openReconciliateDialog: false }))}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export type ExtensionDialogProps = {
  open: boolean;
  handleClose: () => void;
}

const ExtensionDialog: FC<ExtensionDialogProps> = ({
  open,
  handleClose
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={handleClose}
    >
      <DialogTitle>Extension</DialogTitle>
      <DialogContent>
        <DialogContentText paddingBottom="10px">
          Select an extension service:
        </DialogContentText>
        <Content>
          <DialogInnerContent />
        </Content>
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionDialog;
