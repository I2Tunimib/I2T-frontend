import { Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';

type ErrorProps = {
  inputPath: string;
};

const getError = (pathKeyed: string, errors: Record<string, any>) => {
  return pathKeyed.split('.').reduce((ob, i) => ob?.[i], errors);
};

const FieldError = ({ inputPath }: ErrorProps) => {
  const { formState: { errors } } = useFormContext();

  const error = getError(inputPath, errors);

  return error
    ? <Typography color="#B3261E" variant="body2">{error.message}</Typography>
    : null;
};

export default FieldError;
