import { IconButton, Typography } from '@mui/material';
import clsx from 'clsx';
import {
  useCallback, FC,
  useState, MouseEvent, HTMLAttributes, ReactElement, useMemo, Children, ReactChild
} from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ExpandableListBody from '../ExpandableListBody';
import ExpandableListHeader from '../ExpandableListHeader';
import ExpandableListContext from './ExpandableListContext';
import styles from './ExpandableList.module.scss';

interface ExpandableListProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * List title.
   */
  listTitle: string;
  /**
   * Message shown if list has no content.
   */
  messageIfNoContent?: string;
  /**
   * Direct children are ExpandableListHeader and ExpandableListBody.
   */
  children: ReactElement<typeof ExpandableListHeader | typeof ExpandableListBody>[];
}

/**
 * Expandable list.
 * It shows a preview of the content and then if more items are provided,
 * the list gets expanded on click.
 *
 * @example
 * <ExpandableList>
 *  <ExpandableListHeader>
 *    <ExpandableListItem>Header item</ExpandableListItem>
 *  </ExpandableListHeader>
 *  <ExpandableListBody>
 *    // body is expanded on click
 *    <ExpandableListItem>Hidden item</ExpandableListItem>
 *  </ExpandableListBody>
 * </ExpandableList>
 */
const ExpandableList: FC<ExpandableListProps> = ({
  listTitle,
  messageIfNoContent = 'List is empty',
  children: childrenProp,
  className,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShowMore = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const [header, body] = Children.toArray(childrenProp);
  const contextValue = useMemo(
    () => ({ expanded: isExpanded }),
    [isExpanded],
  );

  return (
    <div className={clsx(styles.Container, className)} {...props}>
      <Typography className={styles.ListTitle} variant="subtitle2">{listTitle}</Typography>
      {(header as ReactElement).props.children.length > 0 ? (
        <>
          {header}
          <ExpandableListContext.Provider value={contextValue}>
            {body}
          </ExpandableListContext.Provider>
          {(body as ReactElement).props.children.length > 0
            && (
              <div className={clsx(
                styles.Footer
              )}>
                <IconButton
                  className={clsx(
                    styles.IconButton,
                    {
                      [styles.Expanded]: isExpanded
                    }
                  )}
                  onClick={handleShowMore}
                  color="primary"
                  size="small">
                  <KeyboardArrowDownRoundedIcon />
                </IconButton>
              </div>
            )}
        </>
      ) : (
        <Typography className={styles.EmptyList} variant="body2" color="textSecondary">
          {messageIfNoContent}
        </Typography>
      )}

    </div>
  );
};

export default ExpandableList;
