import api from "./api";

export async function fetchPaginated(modelEndpoint, params) {
  try {
    const response = await api.get(modelEndpoint, { params });
    return response.data;
  } catch (error) {
    console.error("Fallback handler:", error);
    return {
      results: [],
      count: 0,
      next: null,
      previous: null
    };
  }
}