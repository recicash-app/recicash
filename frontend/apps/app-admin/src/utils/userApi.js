import api from "@shared/utils/api";
import { fetchPaginated } from "./services";

export async function fetchUsers({ page, page_size } = {}) {
  const res = await fetchPaginated("/users/", { page, page_size });
  return res;
}

export async function fetchUser(id) {
  const res = await api.get(`/users/${id}/`);
  return res.data;
}

export async function createUser(payload) {
  const res = await api.post("/users/", payload);
  return res.data;
}

export async function updateUser(id, payload) {
  const res = await api.put(`/users/${id}/`, payload);
  return res.data;
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}/`);
  return true;
}

export async function fetchMe() {
  const res = await api.get("/users/me/");
  return res.data;
}

export async function createAdmin(payload) {
  const res = await api.post("/users/create_admin/", payload);
  return res.data;
}

export async function createManager(payload) {
  const res = await api.post("/users/create_manager/", payload);
  return res.data;
}

export async function setPermission(userId, accessLevel) {
  const res = await api.patch(`/users/${userId}/set_permission/`, { access_level: accessLevel });
  return res.data;
}

export async function assignRecyclingPoint(userId, recyclingPointId) {
  const res = await api.post(`/users/${userId}/assign_recycling_point/`, {
    recycling_point_id: recyclingPointId,
  });
  return res.data;
}