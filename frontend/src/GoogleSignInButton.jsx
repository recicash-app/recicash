import React, { useEffect } from 'react';

function GoogleButton() {
    useEffect(() => {
        google.accounts.id.initialize({
          client_id: 'SEU_CLIENT_ID_DO_GOOGLE', // TO-DO: console.cloud.google.com
          callback: handleCredentialResponse,
        });
    
        google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'outline', size: 'large', width: 300 }
        );
      }, []);
    
      const handleCredentialResponse = (response) => {
        console.log("Token JWT do Google:", response.credential);
      };
    
      return <div id="googleSignInDiv"></div>;
}

export default GoogleButton;