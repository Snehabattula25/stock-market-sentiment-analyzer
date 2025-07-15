import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Form, Spinner, Alert } from "react-bootstrap";

function LiveStockPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const backendURL = "http://127.0.0.1:5000"; // ✅ Update for deployment if needed

  useEffect(() => {
    fetchLiveStocks();

    const interval = setInterval(() => {
      fetchLiveStocks(); // auto-refresh every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchLiveStocks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${backendURL}/stocks`);
      if (res.data && res.data.stocks) {
        setStocks(res.data.stocks);
      } else {
        setError("No stock data available.");
      }
    } catch (err) {
      console.error("Error fetching live stocks:", err);
      setError("Failed to fetch stock data.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.company_name.toLowerCase().includes(search.toLowerCase()) ||
    stock.stock_symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container className="mt-4">
      <h2 className="mb-3 text-center">📡 Live Stock Data</h2>

      <Form.Control
        type="text"
        placeholder="🔍 Search stocks by company or symbol..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Loading live data...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      ) : filteredStocks.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Company</th>
              <th>Symbol</th>
              <th>Price</th>
              <th>Profit</th>
              <th>Loss</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock, i) => (
              <tr key={i}>
                <td>{stock.company_name}</td>
                <td>{stock.stock_symbol}</td>
                <td>₹{stock.price}</td>
                <td>{stock.profit != null ? `₹${stock.profit}` : "-"}</td>
                <td>{stock.loss != null ? `₹${stock.loss}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info" className="text-center">
          No matching stocks found.
        </Alert>
      )}
    </Container>
  );
}

export default LiveStockPage;
