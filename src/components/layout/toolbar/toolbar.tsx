import styles from './toolbar.module.scss';

const Toolbar = () => (
  <div className={styles.header}>
    <div className={styles['header-left']}>
      <div>
        <h1>I2T4E</h1>
        <h5>Interactive Interpretation of Tables for Extension</h5>
      </div>
    </div>
  </div>
);

export default Toolbar;
