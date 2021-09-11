import { FC, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectIsUploadDialogOpen } from '@store/slices/tables/tables.selectors';
import { updateUI } from '@store/slices/tables/tables.slice';
import Sidebar from '../Sidebar';
import Toolbar from '../Toolbar';
import Content from '../Content';
import styles from './Homepage.module.scss';
import UploadDialog from '../UploadDialog';

interface HomepageProps { }

const Homepage: FC<HomepageProps> = () => {
  const dispatch = useAppDispatch();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isUploadDialogOpen = useAppSelector(selectIsUploadDialogOpen);

  const onFileChange = (files: File[]) => {
    setSelectedFiles(files);
    dispatch(updateUI({
      uploadDialogOpen: true
    }));
  };

  return (
    <div className={styles.OuterContainer}>
      <Toolbar />
      <div className={styles.InnerContainer}>
        <Sidebar onFileChange={onFileChange} />
        <Content onFileChange={onFileChange} />
      </div>
      {isUploadDialogOpen && <UploadDialog open={isUploadDialogOpen} files={selectedFiles} />}
    </div>
  );
};

export default Homepage;
