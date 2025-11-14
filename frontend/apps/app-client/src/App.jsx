import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Header from '@shared/ui/navigation/Header';
import Test from './Test';

function App() {
  return (
    <>
      <Header type="client"/>
      <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw' }}>
        <Routes>
          <Route path="/test" element={<Test />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
