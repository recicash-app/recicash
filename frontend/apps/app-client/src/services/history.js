import api from "@shared/utils/api"; 

export async function getRecyclings ({ userId }) {

    return api.get(`/recyclings/?user_id=${userId}&status=REDEEMED`);
    
}