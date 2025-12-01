import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Home from './pages/Home';
import Header from './components/Header';
import ProtectedRoute from '@shared/utils/ProtectedRoute';
import { AUTH_URL } from '@shared/utils/constants';

function App() {
  return (
    <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw' }}>
      <Header />

      <Routes>
        <Route element={<ProtectedRoute roles={['M']} />}>
          <Route path="/" element={<Home />} />
          <Route path="/perfil" element={<Navigate to={`${AUTH_URL}/dados`} />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
