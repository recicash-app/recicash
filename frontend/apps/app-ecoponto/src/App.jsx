import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Test from './Test';
import ProtectedRoute from "@shared/utils/ProtectedRoute";

function App() {
  return (
    <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw' }}>
      <Routes>
        <Route element={<ProtectedRoute roles={['E']} />}>
          <Route path="/test" element={<Test />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
