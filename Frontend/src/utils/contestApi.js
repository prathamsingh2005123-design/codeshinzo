// Filename: Frontend/src/utils/contestApi.js
import axiosClient from "./axiosClient";

// GET ALL CONTESTS
export const getContests = async () => {
  const res = await axiosClient.get("/contests");
  return res.data;
};

// GET SINGLE CONTEST (🔥 ADD THIS)
export const getContest = async (id) => {
  const res = await axiosClient.get(`/contests/${id}`);
  return res.data;
};