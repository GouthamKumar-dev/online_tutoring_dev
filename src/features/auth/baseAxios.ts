import axios from "axios";
import { API_BASE_URL } from "../../constants/config";

const baseAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default baseAxios;





