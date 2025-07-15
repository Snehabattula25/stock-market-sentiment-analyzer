import React, { useEffect, useState } from "react";
import axios from "axios";

function LiveStockInfo({ symbol }) {
  const [stock, setStock] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [chartURL, setChartURL] = useState("");

  const backendURL = "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchLiveStock = async () => {
      setError("");
      setStock(null);
      setAlertMessage("");
      setChartURL("");
      setLoading(true);

      if (!symbol.trim()) {
        setError("Invalid stock symbol");
        setLoading(false);
        return;
      }

      try {
        // ✅ Live price & info
        const res = await axios.get(`${backendURL}/stock-info/${symbol}`);
        if (res.data && res.data.stock_symbol) {
          const timestamp = new Date().toLocaleString();
          const enrichedData = {
            ...res.data,
            name: res.data.company_name,
            symbol: res.data.stock_symbol,
            previousClose: res.data.price - (res.data.profit || -res.data.loss || 0),
            open: res.data.price,
            exchange: "N/A",
            currency: "INR",
            timestamp
          };

          const { price, previousClose } = enrichedData;
          if (price && previousClose) {
            const change = ((price - previousClose) / previousClose) * 100;
            if (Math.abs(change) > 5) {
              setAlertMessage(`🔔 Price changed by ${change.toFixed(2)}% from previous close!`);
            }
          }

          setStock(enrichedData);
          localStorage.setItem("lastStockData", JSON.stringify(enrichedData));
        } else {
          setError("Stock not found");
        }

        // ✅ Historical Chart
        const chartRes = await axios.get(`${backendURL}/stock-history/${symbol}`);
        if (chartRes.data && chartRes.data.graph_url) {
          setChartURL(`${backendURL}${chartRes.data.graph_url}`);
        }

      } catch (err) {
        console.error("API error:", err);
        setError("Stock not found or API error");

        const cached = localStorage.getItem("lastStockData");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.symbol === symbol) {
            setStock(parsed);
          }
        }
      }

      setLoading(false);
    };

    fetchLiveStock();
  }, [symbol]);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>📈 Live Stock Info</h1>

      {loading && <p>🔄 Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {alertMessage && <p style={{ color: "orange", fontWeight: "bold" }}>{alertMessage}</p>}

      {stock && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "2px solid #ccc",
            borderRadius: "8px",
            maxWidth: "500px",
            marginInline: "auto",
            backgroundColor: "#f9f9f9"
          }}
        >
          <h2>{stock.name}</h2>
          <p><strong>Symbol:</strong> {stock.symbol}</p>
          <p><strong>Price:</strong> ₹{stock.price}</p>
          <p><strong>Previous Close:</strong> ₹{stock.previousClose?.toFixed(2)}</p>
          <p><strong>Open:</strong> ₹{stock.open}</p>
          <p><strong>Exchange:</strong> {stock.exchange}</p>
          <p><strong>Currency:</strong> {stock.currency}</p>
          <p><strong>Last Updated:</strong> {stock.timestamp}</p>
        </div>
      )}

      {chartURL && (
        <div style={{ marginTop: "30px" }}>
          <h3>📊 7-Day Historical Closing Prices</h3>
          <img
            src={chartURL}
            alt="Historical Stock Chart"
            style={{ maxWidth: "100%", border: "1px solid #ccc", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}

export default LiveStockInfo;
