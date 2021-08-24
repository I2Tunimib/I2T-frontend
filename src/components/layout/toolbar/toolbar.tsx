import styles from './Toolbar.module.scss';

/**
 * A toolbar component.
 */
const Toolbar = () => (
  <div className={styles.Header}>
    <div className={styles.HeaderLeft}>
      <div>
        <h1>I2T4E</h1>
        <h5>Interactive Interpretation of Tables for Extension</h5>
      </div>
    </div>
  </div>
);

export default Toolbar;
