import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Test from './Test';
import Home from './pages/Home';
import Header from './components/navigation/Header';
import BlogPage from './pages/BlogPage';  
import ProtectedRoute from "@shared/utils/ProtectedRoute";
import { AUTH_URL } from '@shared/utils/constants';

function App() {
  return (
    <>
      <Header/>
      <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw', overflowX: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute roles={['U']} />}>
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/perfil" element={<Navigate to={`${AUTH_URL}/dados`} />} />
          </Route>
        </Routes>
      </Box>
    </>
  );
}

export default App;
