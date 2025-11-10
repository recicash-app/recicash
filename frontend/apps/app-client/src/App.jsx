import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Test from './Test';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import BlogPage from './pages/BlogPage';

function App() {
  return (
    <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw' }}>
      <Routes>
        <Route path="/test" element={<Test />} />
        <Route path="/cadastro" element={<SignUpPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/blog" element={<BlogPage />} />
      </Routes>
    </Box>
  );
}

export default App;
