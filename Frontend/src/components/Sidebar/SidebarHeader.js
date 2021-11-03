import React, { useState, useContext } from "react";
import { useSelector } from "react-redux";
import styles from "./SidebarHeader.module.css";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AuthContext from "../../store/AuthContext";
import NewChatInputModal from "./NewChatInput";

import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Grow,
  withStyles,
} from "@material-ui/core";

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
));

const SidebarHeader = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const authCtx = useContext(AuthContext);
  const userProfile = useSelector((state) => state.userReducer.profileUrl);

  const menuHandler = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onMenuCloseHandler = () => {
    setAnchorEl(null);
  };

  const showInputDialogHandler = () => {
    setShowInput(true);
    setAnchorEl(null);
  };

  const closeModalHandler = () => {
    setShowInput(false);
  };

  return (
    <div className={styles["sidebar-header"]}>
      <Avatar
        style={{ height: "50px", width: "50px" }}
        alt="User Profile image"
        src={userProfile}
      />
      <div className={styles["sidebar-header__right"]}>
        <IconButton>
          <DonutLargeIcon />
        </IconButton>
        <IconButton>
          <ChatIcon />
        </IconButton>
        <IconButton
          aria-controls={"simple-menu"}
          aria-haspopup="true"
          onClick={menuHandler}
        >
          <MoreVertIcon />
        </IconButton>
        <StyledMenu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={onMenuCloseHandler}
          TransitionComponent={Grow}
        >
          <MenuItem onClick={showInputDialogHandler}>New Chat</MenuItem>
          <MenuItem
            onClick={() => {
              authCtx.signOut();
            }}
          >
            Logout
          </MenuItem>
        </StyledMenu>
      </div>
      {showInput && <NewChatInputModal onCancel={closeModalHandler} />}
    </div>
  );
};

export default SidebarHeader;
