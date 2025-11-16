import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Test from './Test';
import { glassInstructions, paperInstructions, plasticInstructions, metalInstructions } from './data/recyclingInstructions';
import PostLayout from '@shared/ui/PostLayout';

function App() {
  return (
    <Box sx={{ mt: 4, pb: 4, px: 3, maxWidth: '100vw' }}>
      <Routes>
        <Route path="/test" element={<Test />} />
        <Route path="/test-paper" element={<div style={{ padding: "16px "}}> <PostLayout data={paperInstructions} isEditing={false} /> </div>} />
        <Route path="/test-plastic" element={<PostLayout data={plasticInstructions} isEditing={false} />} />
        <Route path="/test-glass" element={<PostLayout data={glassInstructions} isEditing={false} />} />
        <Route path="/test-metal" element={<PostLayout data={metalInstructions} isEditing={false} />} />
      </Routes>
    </Box>
  );
}

export default App;
