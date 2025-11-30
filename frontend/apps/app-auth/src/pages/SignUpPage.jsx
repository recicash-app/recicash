import { Stack, Box, Typography } from '@mui/material'
import Form from '../components/sign-up/Form';
import Information from '../components/sign-up/Information';

function SignUpPage() {
  return(
    <Box>
      <Information style={{ zIndex: '-1' }}/>
      <Stack spacing={8} style={{ position: 'absolute', left: '8vw', top: '20vh' }}>
        <Typography variant='h4' fontFamily='Poppins' fontWeight='bold'> Cadastro </Typography>
        <Form />
      </Stack>
    </Box>
  )
}
  
export default SignUpPage;