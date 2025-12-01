import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Test from './Test';
import UserHome from './pages/UserHome';
import Landing from './pages/Landing';
import Header from './components/navigation/Header';
import BlogPage from './pages/BlogPage';
import History from './pages/History';
import Wallet from './pages/Wallet';
import ProtectedRoute from "@shared/utils/ProtectedRoute";
import { AUTH_URL } from '@shared/utils/constants';


function App() {
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Header/>
      <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw', overflowX: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/test" element={<Test />} />
          
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute roles={['U']} />}>
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/inicio" element={<UserHome />} />
            <Route path="/carteira" element={<Wallet />} />
            <Route path="/historico" element={<History />} />
            <Route path="/perfil" element={<Navigate to={`${AUTH_URL}/dados`} />} />
          </Route>
        
        </Routes>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
