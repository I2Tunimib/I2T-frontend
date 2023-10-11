import { useAppDispatch, useAppSelector } from '@hooks/store';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { selectIsLoggedIn } from '@store/slices/auth/auth.selectors';
import { authLogout } from '@store/slices/auth/auth.thunk';
import { useState, PropsWithChildren, MouseEvent } from 'react';
import { useHistory } from 'react-router-dom';

type UserAvatarProps = PropsWithChildren<{}>

const UserAvatar = ({ children }: UserAvatarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const history = useHistory();
  const dispatch = useAppDispatch();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(authLogout()).unwrap().then(() => {
      history.push('/');
    });
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <Avatar sx={{ width: 34, height: 34 }}>
          {children}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserAvatar;
