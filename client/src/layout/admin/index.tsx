import { ReactNode, useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import styles from "./styles.module.css";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { minHeight } from "@mui/system";

const navigation = [
  {
    icon: <HomeIcon fontSize="large" />,
    title: "Home",
    to: "/dashboard/youtube-videos",
  },
  {
    icon: <SlowMotionVideoIcon fontSize="large" />,
    title: "Generate",
    to: "/dashboard/generate",
  },
  {
    icon: <AccountCircleIcon fontSize="large" />,
    title: "Account",
    to: "/dashboard/my-account",
  },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await api.post(`/v1/auth/logout`, {});
    userContext?.setUser(null);
    handleClose();
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <div className={styles.logoDiv}>
          <img src="https://tailwindui.com/img/logos/workflow-mark.svg?color=white" />
        </div>
        <ul className={styles.navList}>
          {navigation.map((nav) => (
            <li
              style={window.location.pathname.includes(nav.to) ? { backgroundColor: "rgba(0, 0, 0, 0.123)" } : {}}
              key={nav.title}
              onClick={() => navigate(nav.to)}
              className={styles.navItem}
            >
              {nav.icon}
              <p>{nav.title}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.container2}>
        <div className={styles.appBar}>
          <p className={styles.title}></p>
          <div className={styles.appBarUser}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p className={styles.username}>{userContext?.user?.username}</p>
              <PersonOutlineIcon fontSize="large" />
            </div>
            <IconButton
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={() => navigate("/dashboard/my-account")}>My Account</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        </div>
        <div style={{ position: "relative", minHeight: "50vh" }}>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
