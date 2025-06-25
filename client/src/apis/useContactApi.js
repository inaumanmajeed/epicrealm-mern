import { useMutation, useQuery } from "@tanstack/react-query";
import httpRequest from "../axios/httpRequest";
import { apiEndPoints } from "../constants/apiEndPoints";

const useContactApi = () => {
  const { SUBMIT } = apiEndPoints.contact;

  // Submit contact form
  const submitContact = useMutation({
    mutationFn: async (data) => {
      const response = await httpRequest().post(SUBMIT, data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Contact form submitted successfully:", data);
    },
    onError: (error) => {
      console.error("Contact form submission error:", error);
    },
  });

  return {
    submitContact,
  };
};

export default useContactApi;
