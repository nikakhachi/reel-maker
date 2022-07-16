import { ReactNode, useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import styles from "./styles.module.css";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import { IconButton, Menu, MenuItem, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

const navigation = [
  {
    icon: <HomeIcon fontSize="large" />,
    title: "Home",
    to: "/dashboard",
  },
  {
    icon: <SlowMotionVideoIcon fontSize="large" />,
    title: "Generate",
    to: "/generate",
  },
  {
    icon: <AccountCircleIcon fontSize="large" />,
    title: "Account",
    to: "/dashboard",
  },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <div className={styles.logoDiv}>
          <img src="https://tailwindui.com/img/logos/workflow-mark.svg?color=white" />
        </div>
        <ul className={styles.navList}>
          {navigation.map((nav) => (
            <li onClick={() => navigate(nav.to)} className={styles.navItem}>
              {nav.icon}
              <p>{nav.title}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.container2}>
        <div className={styles.appBar}>
          <TextField fullWidth variant="filled" />
          <div className={styles.appBarUser}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p className={styles.username}>{userContext?.user?.username}</p>
              <PersonOutlineIcon fontSize="large" />
            </div>
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
