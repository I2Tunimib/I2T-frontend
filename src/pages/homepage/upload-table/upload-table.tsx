import { Button } from '@components/core';
import { Uploader } from '@components/kit';
import {
  useState,
  ChangeEvent,
  MouseEvent,
  KeyboardEvent
} from 'react';
import styles from './upload-table.module.scss';

const UploadTable = () => {
  // keep track of the selected file
  const [selectedFile, setSelectedFile] = useState<File>();

  const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <Uploader selectedFile={selectedFile} handleChangeFile={(e) => handleChangeFile(e)} />
  );
};

export default UploadTable;
