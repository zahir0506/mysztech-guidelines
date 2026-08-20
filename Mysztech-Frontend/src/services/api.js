import axios from 'axios';

// Memanggil URL asas Strapi daripada fail .env
const api = axios.create({
  baseURL: import.meta.env.VITE_STRAPI_API_URL,
});

// Fungsi untuk menarik data dari koleksi "Article" (berdasarkan nama yang awak set di Strapi)
export const getArticles = () => api.get('/articles?sort=Title:asc&populate=*');

// Fungsi tambahan untuk koleksi lain jika awak dah bina di Strapi nanti
export const getCategories = () => api.get('/categories?populate=*');
export const getFaqs = () => api.get('/faqs?populate=*');
// Tambah di bawah sekali
export const getWhatToDos = () => api.get('/what-to-dos?populate=*');
export const getWhatNotToDos = () => api.get('/what-not-to-dos?populate=*');

// Tambahkan kod ini di bawah sekali dalam fail api.js awak
export const getFaq1 = () => api.get('/faq-1s?populate=*');
export const getFaq2 = () => api.get('/faq-2s?populate=*');
export const getFaq3 = () => api.get('/faq-3s?populate=*');
export const getFaq4 = () => api.get('/faq-4s?populate=*');