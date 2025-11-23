import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Header from '@shared/ui/navigation/Header';
import Test from './Test';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <>
      <Header/>
      <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw' }}>
        <Routes>
        <Route path="/test" element={<Test />} />
        <Route path="/cadastro" element={<SignUpPage />} />
        <Route path="/login" element={<SignInPage />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
