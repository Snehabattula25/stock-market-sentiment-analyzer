import axios from "axios";



// ✅ 🔥 Add this function for stock recommendation
export const getRecommendation = async () => {
  const res = await axios.get(`http://localhost:5000/recommend`);
  return res.data.recommended;
};
