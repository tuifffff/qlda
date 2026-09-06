import { axiosClient } from './axiosClient.js';

export const productApi = {
  getAll: ({ page = 0, size = 12, sortBy = 'id' } = {}) =>
    axiosClient.get('/api/product', { params: { page, size, sortBy } }),
  search: ({ keyword, page = 0, size = 12 }) =>
    axiosClient.get('/api/product/search', { params: { keyword, page, size } }),
  getByCategory: ({ categoryId, page = 0, size = 12 }) =>
    axiosClient.get(`/api/product/category/${categoryId}`, { params: { page, size } }),
  getByBrand: ({ brandId, page = 0, size = 12 }) =>
    axiosClient.get(`/api/product/brand/${brandId}`, { params: { page, size } }),
  getById: (id) => axiosClient.get(`/api/product/${id}`),
};
