import React, { useEffect } from 'react';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleButton() {

    useEffect(() => {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
    
        google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'outline', size: 'large', width: 300 }
        );
      }, []);
    
      const handleCredentialResponse = (response) => {
        console.log("Token JWT do Google:", response.credential);
        // Esse token JWT precisa ser enviado ao backend.
        // O backend valida o JWT usando a biblioteca google-auth ou PyJWT
        // Após validar, loga o usuário no sistema (criando token)
        // Retorna ao frontend
      };
    
      return <div id="googleSignInDiv"></div>;
}

export default GoogleButton;