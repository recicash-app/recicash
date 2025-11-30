import { Stack, Divider, Box, Typography } from '@mui/material'
import GreenSpot from '@shared/assets/shape-bottom-right.svg'
import Tree from '/tree.svg'

import Form from '../components/sign-in/Form';
import SignUpOption from '../components/sign-in/SignUpOption';

function SignInPage() {
  return(
    <Box>
      <img src={GreenSpot} alt="Green Spot" style={{ position: 'fixed', bottom: '0vw', right: '0vw', width: "47vw", transform: "scaleX(1.2)", indexZ: '-1' }} />
      <img src={Tree} alt="Tree" style={{ position: 'fixed', bottom: '0vw', right: '0vw', width: "45vw", indexZ: '-1' }} />
      <Stack spacing={8} style={{ position: 'absolute', left: '8vw', top: '25vh' }}>
        <Typography variant='h4' fontFamily='Poppins' fontWeight='bold' > Login </Typography>
        <Stack spacing={4}>
          <Form />
          <Divider>ou</Divider>
          <Stack spacing={4} style={{ alignItems:'center' }}>
            <Box display="flex" alignItems="center">
              <Typography fontFamily="Poppins" fontSize="14px"> Não tem conta?</Typography>
              <SignUpOption />
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}
  
export default SignInPage;
  