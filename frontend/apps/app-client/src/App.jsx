import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Test from './Test';
import Home from './pages/Home';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Header from './components/navigation/Header';
import BlogPage from './pages/BlogPage';
import History from './pages/History';
import Wallet from './pages/Wallet';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Header/>
      <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw', overflowX: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/cadastro" element={<SignUpPage />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/historico" element={<History />} /> 
          <Route path="/carteira" element={<Wallet />} />
        </Routes>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
