import { FC, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectIsUploadDialogOpen, selectIsUploadProgressDialogOpen, selectUploadRequests } from '@store/slices/tables/tables.selectors';
import { updateUI } from '@store/slices/tables/tables.slice';
import Sidebar from '../Sidebar';
import Toolbar from '../Toolbar';
import Content from '../Content';
import styles from './Homepage.module.scss';
import UploadDialog from '../UploadDialog';
import UploadProgress from '../UploadProgress/UploadProgress';

interface HomepageProps { }

interface UploadRequestState {
  id: string;
  request: any;
}

const Homepage: FC<HomepageProps> = () => {
  const dispatch = useAppDispatch();
  const [uploadRequests, setUploadRequests] = useState<UploadRequestState[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isUploadDialogOpen = useAppSelector(selectIsUploadDialogOpen);
  const isUploadProgressDialogOpen = useAppSelector(selectIsUploadProgressDialogOpen);

  const onFileChange = (files: File[]) => {
    setSelectedFiles(files);
    dispatch(updateUI({
      uploadDialogOpen: true
    }));
  };

  const onNewUploadRequest = (request: any, id: string) => {
    setUploadRequests((requests) => [...requests, { id, request }]);
  };

  const onCancelUploadRequest = (id: string) => {
    const reqIndex = uploadRequests.findIndex((req) => req.id === id);
    const requestToCancel = uploadRequests[reqIndex];
    requestToCancel.request.abort();
    setUploadRequests([
      ...uploadRequests.slice(0, reqIndex),
      ...uploadRequests.slice(reqIndex + 1)
    ]);
  };

  return (
    <>
      <div className={styles.OuterContainer}>
        <Toolbar />
        <div className={styles.InnerContainer}>
          <Sidebar onFileChange={onFileChange} />
          <Content onFileChange={onFileChange} />
        </div>
        {isUploadDialogOpen
          && (
            <UploadDialog
              open={isUploadDialogOpen}
              files={selectedFiles}
              onNewUploadRequest={onNewUploadRequest}
            />
          )}
      </div>
      {isUploadProgressDialogOpen
        && (
          <UploadProgress
            className={styles.UploadList}
            onCancelRequest={onCancelUploadRequest}
          />
        )
      }
    </>
  );
};

export default Homepage;
