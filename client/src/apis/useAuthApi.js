import { useMutation } from "@tanstack/react-query";
import httpRequest from "../axios/httpRequest";
import { apiEndPoints } from "../constants/apiEndPoints";
import toast from "react-hot-toast";

const useAuthApi = () => {
  const { REGISTER, LOGIN, LOGOUT } = apiEndPoints.auth;
  const login = useMutation({
    mutationFn: async (data) => {
      const response = await httpRequest().post(LOGIN, data);
      return response.data;
    },
  });
  const register = useMutation({
    mutationFn: async (data) => {
      const response = await httpRequest().post(REGISTER, data);
      return response.data;
    },
  });
  const logout = useMutation({
    mutationFn: async () => {
      const response = await httpRequest().post(LOGOUT);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
    },
  });

  return { login, register, logout };
};

export default useAuthApi;
