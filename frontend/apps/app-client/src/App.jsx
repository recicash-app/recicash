import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Test from './Test';
import Home from './pages/Home';
import Header from './components/navigation/Header';
import ProtectedRoute from "@shared/utils/ProtectedRoute";

function App() {
  return (
    <>
      <Header/>
      <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw', overflowX: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute roles={['U']} />}>
            <Route path="/test" element={<Test />} />
          </Route>
        </Routes>
      </Box>
    </>
  );
}

export default App;
