import { Button } from '@components/core';
import { Chip } from '@material-ui/core';
import { ChangeEvent, useRef } from 'react';
import PublishRoundedIcon from '@material-ui/icons/PublishRounded';
import DescriptionRoundedIcon from '@material-ui/icons/DescriptionRounded';
import styles from './uploader.module.scss';

interface IUploaderProps {
  selectedFile: File | undefined,
  handleChangeFile: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * File uploader
 */
const Uploader = ({ selectedFile, handleChangeFile }: IUploaderProps) => {
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
