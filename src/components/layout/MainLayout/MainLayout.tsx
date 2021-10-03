import { FC, ReactNode } from 'react';
import Sidebar from '../Sidebar';
import Toolbar from '../Toolbar';
import styles from './MainLayout.module.scss';

interface MainLayoutProps {
  ToolbarContent: ReactNode | (() => ReactNode);
  SidebarContent: ReactNode | (() => ReactNode);
}

const MainLayout: FC<MainLayoutProps> = ({
  ToolbarContent,
  SidebarContent,
  children
}) => {
  return (
    <div className={styles.Container}>
      <Toolbar>
        {typeof ToolbarContent === 'function' ? ToolbarContent() : ToolbarContent}
      </Toolbar>
      <div className={styles.ContentWrapper}>
        <Sidebar>
          {typeof SidebarContent === 'function' ? SidebarContent() : SidebarContent}
        </Sidebar>
        <div className={styles.Content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
