// DEAD CODE — kept temporarily for safety while Muaz reviews this audit.
// Repo-wide grep for `api/client` returns zero importers (2026-05-06).
// This Axios client points at the local Express server and reads a JWT from
// localStorage, but Supabase auth stores its session under its own key, not
// `localStorage.token`. Even if a caller existed, the auth header would be
// empty.
//
// Action for Muaz: delete this file once you confirm nothing references it.
import axios from 'axios';
import { API_URL } from '../config/api';

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
