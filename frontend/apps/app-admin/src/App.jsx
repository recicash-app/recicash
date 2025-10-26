import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

import Sidebar from "./components/sidebar/Sidebar";
// import PostManagementPage from "./pages/PostManagementPage";

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
          <Route path="/" element={<div/>} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
