import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";

import Sidebar from "./components/sidebar/Sidebar";
import PostManagementPage from "./pages/PostManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import ProtectedRoute from "@shared/utils/ProtectedRoute";
import { AUTH_URL } from "@shared/utils/constants";

const drawerWidth = 260;

function App() {
  return (
    <Box sx={{ display: "flex", maxHeight: "100vh" }}>
      {/* Sidebar Drawer */}
      <Sidebar drawerWidth={drawerWidth} />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          ml: `${drawerWidth}px`,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* Page routes */}
        <Routes>
          <Route element={<ProtectedRoute roles={['A']} />}>
            <Route path="/" element={<PostManagementPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/settings" element={<Navigate to={`${AUTH_URL}/dados`} />} />
          </Route>
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
