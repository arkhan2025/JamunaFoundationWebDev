import api from "./api";

export const getCampaigns = async () => {
  try {
    const res = await api.get("/api/campaigns");
    return res.data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
};
