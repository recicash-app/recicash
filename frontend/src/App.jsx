import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Test from './Test';

function App() {
  return (
    <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw' }}>
      <Routes>
        <Route path="/test" element={<Test />} />
      </Routes>
    </Box>
  );
}

export default App;
