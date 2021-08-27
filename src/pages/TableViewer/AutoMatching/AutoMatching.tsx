import { MenuBase } from '@components/core';
import {
  Avatar,
  Button, Chip, makeStyles, PopperPlacementType,
  Slider, Typography
} from '@material-ui/core';
import { FC, useState } from 'react';
import DoneRoundedIcon from '@material-ui/icons/DoneRounded';
import DoneIcon from '@material-ui/icons/Done';
import styles from './AutoMatching.module.scss';

interface AutoMatchingProps {
  open: boolean;
  anchorElement: any;
  id?: string;
  placement?: PopperPlacementType | undefined;
  handleClose: () => void;
}

const marks = [
  {
    value: 0,
    label: '0'
  },
  {
    value: 100,
    label: '100'
  }
];

const AutoMatching: FC<AutoMatchingProps> = ({
  open,
  anchorElement,
  handleClose
}) => {
  const [value, setValue] = useState<number>(30);

  const handleChange = (event: any, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  return (
    <MenuBase
      open={open}
      anchorElement={anchorElement}
      handleClose={handleClose}>
      <div className={styles.MenuContent}>
        <Typography variant="h6" gutterBottom>
          Auto matching
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Choose a threshold to renconcile selected cells.
        </Typography>
        <div className={styles.Row}>
          <Chip
            color="primary"
            variant="outlined"
            size="small"
            avatar={<Avatar>24</Avatar>}
            label="Reconciliated cells"
            deleteIcon={<DoneIcon />}
          />
          /
          <Chip size="small" variant="outlined" avatar={<Avatar>42</Avatar>} label="Selected cells" />
        </div>
        <Slider className={styles.Slider} valueLabelDisplay="on" marks={marks} value={value} onChange={handleChange} />
        <Button color="primary" className={styles.ConfirmButton}>Confirm</Button>
      </div>
    </MenuBase>
  );
};

export default AutoMatching;
