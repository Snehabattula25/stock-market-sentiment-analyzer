import React, { useEffect, useState } from "react";
import { getRecommendation } from "../api";

const Recommendation = () => {
  const [recommended, setRecommended] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecommendation() {
      try {
        const data = await getRecommendation();
        if (data.recommended) {
          setRecommended(data.recommended);
        } else {
          setError("No recommendation available");
        }
      } catch (err) {
        setError("Error fetching recommendation");
      }
    }

    fetchRecommendation();
  }, []);

  return (
    <div>
      <h2>🔥 Recommended Stock</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {recommended && (
        <div style={{ border: "1px solid gray", padding: "10px", marginTop: "10px" }}>
          <h3>{recommended.company_name} ({recommended.stock_symbol})</h3>
          <p>📈 Price: ₹{recommended.price}</p>
          <p>💹 Trend: {recommended.trend}</p>
          <p>🧠 Sentiment: {recommended.sentiment}</p>
          {recommended.profit && <p style={{ color: "green" }}>+₹{recommended.profit} gain</p>}
          {recommended.loss && <p style={{ color: "red" }}>-₹{recommended.loss} loss</p>}
        </div>
      )}
    </div>
  );
};

export default Recommendation;
