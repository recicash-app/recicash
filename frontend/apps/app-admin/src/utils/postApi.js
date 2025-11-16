import api from "./api";
import { fetchPaginated } from "./services";

export async function fetchPosts({ page, page_size }) {
  const res = await fetchPaginated("/posts/", { page, page_size });
  return res;
}

export async function fetchPost(id) {
  const res = await api.get(`/posts/${id}/`);
  return res.data;
}

export async function createPost({ title, text, imageFile }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("text", text);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await api.post("/posts/", formData);
  return res.data;
}

export async function updatePost(id, { title, text, imageFile }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("text", text);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await api.put(`/posts/${id}/`, formData);
  return res.data;
}

export async function deletePost(id) {
  await api.delete(`/posts/${id}/`);
  return true;
}

export async function deletePostImage(postId) {
  await api.delete(`/posts/${postId}/delete_image/`);
  return true;
}

export async function searchPosts(query) {
  const res = await api.get("/posts/search/", { params: { q: query } });
  return res.data.results;
}

export async function searchSuggestions(query, limit = 5) {
  const res = await api.get("/posts/search_suggestions/", { params: { q: query, limit } });
  return res.data.suggestions;
}