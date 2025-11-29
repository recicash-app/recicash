import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Test from './Test';
import Home from './pages/Home';
import Header from './components/navigation/Header';
import BlogPage from './pages/BlogPage';
import History from './pages/History';
import Wallet from './pages/Wallet';
import ProtectedRoute from "@shared/utils/ProtectedRoute";

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Header/>
      <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw', overflowX: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute roles={['U']} />}>
            <Route path="/test" element={<Test />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/historico" element={<History />} /> 
          <Route path="/carteira" element={<Wallet />} />
          </Route>
        </Routes>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
