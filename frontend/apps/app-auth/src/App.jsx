import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import LogoutPage from './pages/LogoutPage';
import ForbiddenPage from './pages/ForbiddenPage';

function App() {
  return (
    <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw', overflowX: 'hidden' }}>
      <Routes>
        <Route path="/login" element={<SignInPage />} />
        <Route path="/cadastro" element={<SignUpPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="*" element={<ForbiddenPage />} />
      </Routes>
    </Box>
  );
}

export default App;
