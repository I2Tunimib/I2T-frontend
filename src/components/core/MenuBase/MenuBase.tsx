import {
  ClickAwayListener, Paper,
  Popper, PopperPlacementType
} from '@mui/material';
//import makeStyles from '@mui/styles/makeStyles';
import styled from '@emotion/styled';
import { FC, useEffect } from 'react';
import styles from './MenuBase.module.scss';

export interface MenuBaseProps {
  open: boolean;
  anchorElement: any;
  id?: string;
  placement?: PopperPlacementType | undefined;
  handleClose: () => void;
}

/*
const useMenuStyles = makeStyles({
  paper: {
    maxHeight: 'calc(100% - 96px)',
    WebkitOverflowScrolling: 'touch',
    outline: 0
  }
});
 */

const StyledPaper = styled(Paper)`
  max-height: calc(100% - 96px);
  -webkit-overflow-scrolling: touch;
  outline: 0;
`;

const MenuBase: FC<MenuBaseProps> = ({
  open,
  anchorElement,
  id = 'id-menu',
  placement = 'bottom-start',
  children,
  handleClose
}) => {
  //const menuClasses = useMenuStyles();
  return (
    <>
      {anchorElement && (
        <Popper
          id={id}
          open={open}
          anchorEl={anchorElement}
          placement={placement}
          className={styles.MenuContainer}
        >
          {() => (
            <ClickAwayListener onClickAway={handleClose}>
              <StyledPaper elevation={3}
                           //className={menuClasses.paper}
              >
                {children}
              </StyledPaper>
            </ClickAwayListener>
          )}
        </Popper>
      )}
    </>
  );
};

export default MenuBase;
