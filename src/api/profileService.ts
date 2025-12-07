import { apiClient } from "./apiClient";

// import apiClient from "./apiClient";

export const getProfile = async () => {
    const response = await apiClient.get("/auth/profile/");
    return response.data;
};

export const updateProfile = async (profileData: any) => {
    const response = await apiClient.put("/auth/profile/", profileData);
    return response.data;
};
