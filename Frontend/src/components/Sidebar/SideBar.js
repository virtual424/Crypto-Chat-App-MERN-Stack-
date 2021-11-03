import React from "react";
import styles from "./SideBar.module.css";
import SidebarChats from "./SidebarChats";
import SidebarHeader from "./SidebarHeader";
import SidebarSearch from "./SidebarSearch";

const SideBar = () => {
  return (
    <div className={styles.sidebar}>
      <SidebarHeader />
      <SidebarSearch />
      <SidebarChats />
    </div>
  );
};

export default SideBar;
