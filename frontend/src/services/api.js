import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/products';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchProducts = async (search = '', category = '') => {
  const response = await api.get('/', {
    params: { search, category }
  });
  return response.data;
};

export const fetchProductById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

export const stockInProduct = async (id, stockData) => {
  const response = await api.post(`/${id}/stock-in`, stockData);
  return response.data;
};

export const stockOutProduct = async (id, stockData) => {
  const response = await api.post(`/${id}/stock-out`, stockData);
  return response.data;
};

export const fetchProductTransactions = async (id) => {
  const response = await api.get(`/${id}/transactions`);
  return response.data;
};

export default api;
