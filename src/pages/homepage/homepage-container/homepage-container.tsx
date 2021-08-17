import { Toolbar } from '@components/layout';
import LoadData from '../load-data/load-data';
import styles from './homepage-container.module.scss';

const HomepageContainer = () => (
  <>
    <Toolbar />
    <div className={styles.Container}>
      <LoadData />
    </div>
  </>

);

export default HomepageContainer;
