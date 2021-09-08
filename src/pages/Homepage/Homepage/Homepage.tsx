import { FC } from 'react';
import Sidebar from '../Sidebar';
import Toolbar from '../Toolbar';
import Content from '../Content';
import styles from './Homepage.module.scss';

interface HomepageProps { }

const Homepage: FC<HomepageProps> = () => {
  return (
    <div className={styles.OuterContainer}>
      <Toolbar />
      <div className={styles.InnerContainer}>
        <Sidebar />
        <Content />
      </div>
    </div>
  );
};

export default Homepage;
