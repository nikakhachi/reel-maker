import axios, { AxiosRequestConfig } from "axios";

export const API_ENDPOINT = "http://localhost:5000/api";

const getRequestConfig = (): AxiosRequestConfig => ({
  withCredentials: true,
});
const get = async (url: string) => {
  const { data } = await axios.get(`${API_ENDPOINT}${url}`, getRequestConfig());
  return data;
};

const post = async (url: string, dataToSend: Record<any, any>) => {
  const { data } = await axios.post(`${API_ENDPOINT}${url}`, dataToSend, getRequestConfig());
  return data;
};

const put = async (url: string, dataToSend: Record<any, any>) => {
  const { data } = await axios.put(`${API_ENDPOINT}${url}`, dataToSend, getRequestConfig());
  return data;
};

const patch = async (url: string, dataToSend: Record<any, any>) => {
  const { data } = await axios.patch(`${API_ENDPOINT}${url}`, dataToSend, getRequestConfig());
  return data;
};

const remove = async (url: string) => {
  const { data } = await axios.delete(`${API_ENDPOINT}${url}`, getRequestConfig());
  return data;
};

export const api = { get, post, remove, put, patch };
