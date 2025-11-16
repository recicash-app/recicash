import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

export const menuItems = [
  {
    name: "Publicações", 
    icon: DashboardRoundedIcon, 
    path: "/"
  },
  { 
    name: "Usuários e Permissões", 
    icon: AdminPanelSettingsRoundedIcon,
    path: "/users"
  },
  { 
    name: "Configurações", 
    icon: SettingsRoundedIcon,
    path: "/settings"
  },
];