import { Button } from '@components/core';
import { Chip } from '@mui/material';
import { ChangeEvent, FC, useRef } from 'react';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import styles from './Uploader.module.scss';

interface UploaderProps {
  /**
   * File selected from the file system.
   */
  selectedFile: File | undefined,
  /**
   * Handler function on new file selected.
   */
  handleChangeFile: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * File uploader.
 */
const Uploader: FC<UploaderProps> = ({ selectedFile, handleChangeFile }) => {
  // ref to hidden input file
  const inputFileRef = useRef<HTMLInputElement>(null);

  // handle click on uploader
  const handleClick = () => {
    inputFileRef.current?.click();
  };

  return (
    <>
      <div className={styles.ButtonContainer}>
        <Button onClick={handleClick}>
          Choose file
        </Button>
        <Chip
          icon={<DescriptionRoundedIcon />}
          label={selectedFile ? `Selected file: ${selectedFile.name}` : 'No file selected'}
        />
      </div>
      <div role="button" tabIndex={0} onClick={handleClick} onKeyDown={handleClick} className={styles.InnerContainer}>
        <PublishRoundedIcon className={styles.Icon} />
        <p>Drop a table here</p>
      </div>
      <input onChange={handleChangeFile} ref={inputFileRef} type="file" name="file" className={styles.InputFile} />
    </>
  );
};

export default Uploader;
