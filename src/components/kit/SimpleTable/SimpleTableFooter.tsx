import { Typography } from '@material-ui/core';
import styles from './SimpleTableFooter.module.scss';

const SimpleTableFooter = () => {
  return (
    <div className={styles.Container}>
      <Typography variant="button" display="block">
        Add row
      </Typography>
    </div>
  );
};

export default SimpleTableFooter;
