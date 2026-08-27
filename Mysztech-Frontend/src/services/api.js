import axios from 'axios';

// Memanggil URL asas Strapi daripada fail .env
const api = axios.create({
  baseURL: import.meta.env.VITE_STRAPI_API_URL,
});

// Tambah parameter "locale" dengan default 'en' pada semua fungsi
export const getArticles = (locale = 'en') => api.get(`/articles?locale=${locale}&sort=Title:asc&populate=*`);

export const getCategories = (locale = 'en') => api.get(`/categories?locale=${locale}&populate=*`);
export const getFaqs = (locale = 'en') => api.get(`/faqs?locale=${locale}&populate=*`);

// Fungsi untuk Troubleshooting
export const getWhatToDos = (locale = 'en') => api.get(`/what-to-dos?locale=${locale}&populate=*`);
export const getWhatNotToDos = (locale = 'en') => api.get(`/what-not-to-dos?locale=${locale}&populate=*`);

export const getFaq1 = (locale = 'en') => api.get(`/faq-1s?locale=${locale}&populate=*`);
export const getFaq2 = (locale = 'en') => api.get(`/faq-2s?locale=${locale}&populate=*`);
export const getFaq3 = (locale = 'en') => api.get(`/faq-3s?locale=${locale}&populate=*`);
export const getFaq4 = (locale = 'en') => api.get(`/faq-4s?locale=${locale}&populate=*`);

export const getPrologues = (locale = 'en') => api.get(`/prologues?locale=${locale}&sort=Title:asc&populate=*`);