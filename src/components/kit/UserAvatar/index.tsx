import { useAppDispatch, useAppSelector } from "@hooks/store";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Avatar,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";
import { authLogout } from "@store/slices/auth/auth.thunk";
import { logoutServer } from "../../../keycloak";
import { useState, PropsWithChildren, MouseEvent } from "react";
import { useHistory } from "react-router-dom";

type UserAvatarProps = PropsWithChildren<{}>;

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
    // clear local auth state first, then redirect to server logout to clear Keycloak session
    dispatch(authLogout())
      .unwrap()
      .finally(() => {
        // Redirect to backend logout which clears cookies and invokes Keycloak end-session
        logoutServer();
      });
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <Avatar sx={{ width: 34, height: 34 }}>{children}</Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
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
