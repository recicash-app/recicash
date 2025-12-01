import api from "@shared/utils/api";

export async function fetchEcopontos(managerId) {
  const res = await api.get(`/recyclings/ecopontos_by_manager/?manager_id=${managerId}`);
  return res.data;
}

export async function createDisposalRecord(payload) {
  const res = await api.post("/recyclings/register_disposal/", payload);
  return res.data;
}

export async function fetchLastDisposalRecord(managerId) {
  const res = await api.get(`/recyclings/last_disposal/?manager_id=${managerId}`);
  return res.data;
}