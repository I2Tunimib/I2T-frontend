import { DragEvent, FC, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import clsx from 'clsx';
import styles from './DroppableArea.module.scss';
import DroppableAreaBottomMessage from '../DroppableAreaBottomMessage';

interface DroppableAreaProps {
  permittedFileExtensions: string[];
  uploadText?: string;
  maxFiles?: number;
  onDrop: (files: File[]) => void;
}

export interface FileRead {
  file: File;
  content: string;
}

const DroppableArea: FC<DroppableAreaProps> = ({
  permittedFileExtensions,
  maxFiles = 1,
  onDrop,
  children,
  ...props
}) => {
  const [drag, setDrag] = useState<boolean>(false);
  const [dragCounter, setDragCounter] = useState<number>(0);

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragCounter((counter) => counter + 1);
    setDrag(true);
  };
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragCounter((counter) => counter - 1);
    if (dragCounter - 1 > 0) {
      return;
    }
    setDrag(false);
  };
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const { files } = event.dataTransfer;
    const permittedFiles: File[] = [];

    Object.keys(files).forEach((key) => {
      const [fileExtension, ...rest] = files[key as any].name.split('.').reverse();
      if (permittedFileExtensions.find((extension) => extension === fileExtension)) {
        permittedFiles.push(files[key as any]);
      }
    });

    if (permittedFiles.length > 0) {
      onDrop(permittedFiles);
      setDrag(false);
      setDragCounter(0);
    }
  };

  return (
    <div
      className={clsx(
        styles.DroppableContainer,
        {
          [styles.Dragging]: drag
        }
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {children}
      <CSSTransition
        in={drag}
        classNames={styles}
        timeout={200}
        unmountOnExit
      >
        <DroppableAreaBottomMessage {...props} />
      </CSSTransition>

    </div>
  );
};

export default DroppableArea;
