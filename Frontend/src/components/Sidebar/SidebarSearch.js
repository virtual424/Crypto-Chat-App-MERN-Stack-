import React from "react";
import styles from "./SidebarSearch.module.css";
import SearchIcon from "@material-ui/icons/Search";

const SidebarSearch = () => {
  return (
    <div className={styles["sidebar-search"]}>
      <div className={styles["sidebar-container"]}>
        <SearchIcon />
        <input placeholder="Search or start a new chat" type="text" />
      </div>
    </div>
  );
};

export default SidebarSearch;
