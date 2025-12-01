import api from "@shared/utils/api"; 

export async function getRecyclings({ userId }) {
  
  return api.get(`/recyclings/?user_id=${userId}&status=REDEEMED`);

};

export async function postNote({ noteCode, userId }) {

    return api.post('/recyclings/record_wallet_history/', {
        validation_hash: noteCode
    });

};