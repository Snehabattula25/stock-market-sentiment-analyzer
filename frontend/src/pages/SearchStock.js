import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";

function SearchStock() {
  const [symbol, setSymbol] = useState("");
  const [stock, setStock] = useState(null);
  const [error, setError] = useState("");
  const backendURL = "http://127.0.0.1:5000";

  const handleSearch = async () => {
    if (!symbol) return;

    try {
      const res = await axios.get(`${backendURL}/stock/${symbol}`);
      setStock(res.data);
      setError("");
    } catch (err) {
      setError("Stock not found or data unavailable.");
      setStock(null);
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4 text-center">🔍 Search Any Stock</h3>

      <Form className="d-flex mb-3">
        <Form.Control
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL, INFY.NS)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <Button variant="primary" className="ms-2" onClick={handleSearch}>
          Search
        </Button>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      {stock && (
        <Card className="mt-4 shadow-sm">
          <Card.Body>
            <Card.Title>{stock.company_name} ({stock.stock_symbol})</Card.Title>
            <p><strong>Price:</strong> ₹{stock.price}</p>
            <p><strong>Sentiment:</strong> {stock.sentiment}</p>
            <p><strong>Profit:</strong> ₹{stock.profit ?? "-"}</p>
            <p><strong>Loss:</strong> ₹{stock.loss ?? "-"}</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default SearchStock;
