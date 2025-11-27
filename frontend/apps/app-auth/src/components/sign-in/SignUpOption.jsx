import { Button } from '@mui/material'
import { styled } from '@mui/system' 

const ButtonText = styled(Button)({
  boxShadow: 'none',
  textTransform: 'none',
  color: '#3A5B22',
  fontWeight: 'bold',
  fontFamily: 'Poppins',
  fontSize: '14px',

  "& .MuiTouchRipple-root": {
      display: "none",
  },

  '&:hover': {
      textDecoration: 'underline',
      backgroundColor: 'transparent',
      boxShadow: 'none',
  },

  '&:focus': {
      outline: 'none',
  },
});

function SignUpOption() { 

  const handleClick = () => {
    // console.log("Redirecionando para a página de cadastro");
    window.location.href = '/cadastro';
  };

  return (
    <ButtonText variant='text' onClick={handleClick}>
      Cadastrar-se
    </ButtonText>
  )
}

export default SignUpOption;