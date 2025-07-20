const locationApi = "https://countriesnow.space/api/v0.1/countries";
import api from "@/utils/interceptor";

export const getLocations = async () => {
  try {
    const response = await api.get(`${locationApi}`);
    return response.data
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
};