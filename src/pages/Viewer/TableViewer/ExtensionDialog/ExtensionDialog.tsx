import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Button,
  Dialog,
  DialogActions,
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
  useEffect
} from 'react';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { ButtonLoading } from '@components/core';
import { selectColumnForExtension, selectExtensionDialogStatus, selectReconcileDialogStatus } from '@store/slices/table/table.selectors';
import { updateUI } from '@store/slices/table/table.slice';
import { selectExtendersAsArray } from '@store/slices/config/config.selectors';
import { Extender } from '@store/slices/config/interfaces/config';
import styled from '@emotion/styled';
import { extend } from '@store/slices/table/table.thunk';
import AsiaGeoExtensionForm from './AsiaGeoExtensionForm';
import DynamicExtensionForm from './DynamicExtensionForm';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const Content = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
});

const Description = styled(Typography)`
  border-radius: 7px;
  padding: 10px;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 10%);
`;

const getDataForGeoExtension = (data: Record<string, string>) => {
  return Object.keys(data).reduce((acc, key) => {
    const [prefix, id] = data[key].split(':');
    if (prefix === 'geo') {
      acc[key] = id;
    }
    return acc;
  }, {} as Record<string, string>);
};

const ExtensionDialog = () => {
  const [currentService, setCurrentService] = useState<Extender>();
  const [subformStatus, setSubformStatus] = useState<{ data: any; valid: boolean }>({
    data: undefined,
    valid: false
  });
  const dispatch = useAppDispatch();
  // keep track of open state
  const open = useAppSelector(selectExtensionDialogStatus);
  const extensionServices = useAppSelector(selectExtendersAsArray);
  const selectedColMetaIds = useAppSelector(selectColumnForExtension);

  useEffect(() => {
    if (extensionServices && extensionServices.length > 0) {
      setCurrentService(extensionServices[0]);
    }
  }, [extensionServices]);

  // const handleConfirm = () => {
  //   if (currentService) {
  //     const data = {
  //       items: getDataForGeoExtension(selectedColMetaIds),
  //       props: subformStatus.data
  //     };

  //     dispatch(extend({
  //       baseUrl: currentService.relativeUrl,
  //       data,
  //       extender: currentService
  //     })).unwrap().then(() => {
  //       dispatch(updateUI({ openExtensionDialog: false }));
  //     });
  //   }
  // };

  const handleClose = () => {
    dispatch(updateUI({ openExtensionDialog: false }));
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const val = extensionServices.find((service) => service.id === event.target.value);
    if (val) {
      setCurrentService(val);
    }
  };

  const handleSubmit = (formState: Record<string, any>) => {
    console.log(formState);
    if (currentService) {
      dispatch(extend({
        extender: currentService,
        formValues: formState
      }));
    }
  };

  // const handleChildFormChange = ({ data, valid }: any) => {
  //   setSubformStatus({
  //     data,
  //     valid
  //   });
  // };

  return (
    <Dialog
      className="default-dialog"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
    >
      <DialogTitle>Extension</DialogTitle>
      <DialogContent>
        <DialogContentText paddingBottom="10px">
          Select an extension service:
        </DialogContentText>
        <Content>
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
              <Description>{currentService.description}</Description>
              <Divider />
              <DynamicExtensionForm onSubmit={handleSubmit} extender={currentService} />
            </>
          )}
        </Content>
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionDialog;
