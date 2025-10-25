import { Button } from '@mui/material';
import { styled } from '@mui/system';

const SendButton = styled(Button)({
    width: '404px',
    height: '32px',
    borderRadius: '10px',
    backgroundColor: '#3A5B22',
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'none',
    '&:hover': {
        backgroundColor: 'rgba(50,180,50,0.8)' 
    },
});

function SendFormButton({ text, onClick, ...props }) {
    return (
        <SendButton onClick={onClick}>
            {text}
        </SendButton>
    );
}

export default SendFormButton;