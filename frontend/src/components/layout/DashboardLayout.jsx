import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CloudUpload as CloudUploadIcon,
  BarChart as BarChartIcon,
  ListAlt as ListAltIcon,
  AccountCircle,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import SwitchUserMenu from "../users/SwitchUserMenu";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

const Logo = ({ size = 24, sx = {} }) => (
  <Box
    component="img"
    src="/cloudbalance_logo_final.png"
    sx={{
      width: size,
      height: size,
      objectFit: "contain",
      ...sx,
    }}
  />
);

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // const [open, setOpen] = useState(!isMobile); // close by default for mobile only
  const [open, setOpen] = useState(false); // close by default

  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isImpersonating } = useSelector((state) => state.auth);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "User Management",
      icon: <PeopleIcon />,
      path: "/users",
      roles: ["ROLE_ADMIN", "ROLE_READ_ONLY"],
    },
    {
      text: "Onboarding",
      icon: <CloudUploadIcon />,
      path: "/onboarding",
      roles: ["ROLE_ADMIN"],
    },
    { text: "Cost Explorer", icon: <BarChartIcon />, path: "/cost-explorer" },
    { text: "AWS Services", icon: <ListAltIcon />, path: "/aws-services" },
  ];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            {!open && <Logo size={40} sx={{ mr: 1 }} />}
            <Typography variant="h6" noWrap component="div">
              CloudBalance
            </Typography>
          </Box>

          {isImpersonating && (
            <Box mr={2} display="flex" alignItems="center">
              <Typography variant="body2" color="inherit">
                Viewing as: {user?.firstName} {user?.lastName}
              </Typography>
            </Box>
          )}
          <SwitchUserMenu onLogout={handleLogout} />
        </Toolbar>
      </AppBarStyled>

      {isImpersonating && (
        <Box
          width="100%"
          sx={{
            // bgcolor: "warning.light",
            bgcolor: "#F3C623",
            color: "warning.contrastText",
            // color: "#856404",

            py: 1,
            textAlign: "center",
            mt: "64px",
            position: "fixed",
            zIndex: 1000,
          }}
        >
          <Typography variant="body2">
            You are currently viewing as {user?.firstName} {user?.lastName}{" "}
            (Customer)
          </Typography>
        </Box>
      )}

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
            <Logo size={40} sx={{ mr: 1 }} />
            <Typography variant="h6" color="primary">
              Menu
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={window.location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main
        open={open}
        sx={{
          ...(isImpersonating && {
            mt: { xs: 5, sm: 4 },
          }),
        }}
      >
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
};

export default DashboardLayout;
