import api from "@shared/utils/api";

export async function fetchEcopontos(managerId) {
  const url = managerId
    ? `/recycling_points/?manager_id=${managerId}`
    : "/recycling_points/";

  const res = await api.get(url);
  return res.data;
}

export async function fetchEcoponto(id) {
  const res = await api.get(`/recycling_points/${id}/`);
  return res.data;
}

export async function createDisposalRecord(payload) {
  const res = await api.post("/recyclings/register_disposal/", payload);
  return res.data;
}
