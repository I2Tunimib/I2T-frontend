import Toolbar from '@components/layout/Toolbar';
import LoadData from '../LoadData';
import styles from './Homepage.module.scss';

const Homepage = () => (
  <>
    <Toolbar />
    <div className={styles.Container}>
      <LoadData />
    </div>
  </>

);

export default Homepage;
