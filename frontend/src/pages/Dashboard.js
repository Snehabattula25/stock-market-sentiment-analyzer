import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Spinner,
} from "react-bootstrap";

function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [sentimentGraphUrl, setSentimentGraphUrl] = useState("");
  const [chartUrl, setChartUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const backendURL = "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [stockRes, recommendRes, graphRes] = await Promise.all([
          axios.get(`${backendURL}/stocks`),
          axios.get(`${backendURL}/recommend`),
          axios.get(`${backendURL}/price-change-graph`),
        ]);

        setStocks(stockRes.data.stocks);
        setRecommended(recommendRes.data.recommended);
        setSentimentGraphUrl(`${backendURL}${graphRes.data.graph_url}`);

        if (recommendRes.data.recommended?.stock_symbol) {
          fetchNews(recommendRes.data.recommended.stock_symbol);
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async (symbol) => {
    try {
      setNewsLoading(true);
      const res = await axios.get(`${backendURL}/news`);
      setNews(res.data.headlines || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchChart = async (symbol) => {
    try {
      const res = await axios.get(`${backendURL}/stock-history/${symbol}`);
      setChartUrl(`${backendURL}${res.data.graph_url}`);
    } catch (error) {
      console.error("Error fetching stock chart:", error);
      setChartUrl("");
    }
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.company_name.toLowerCase().includes(search.toLowerCase()) ||
    stock.stock_symbol.toLowerCase().includes(search.toLowerCase())
  );

  const renderSentiment = (sentiment) => {
    if (sentiment === "Positive") return "😊 Positive";
    if (sentiment === "Negative") return "😞 Negative";
    return "😐 Neutral";
  };

  const renderTrend = (trend) => {
    if (trend === "Uptrend") return "📈 Uptrend";
    if (trend === "Downtrend") return "📉 Downtrend";
    return "➖ Neutral";
  };

  return (
    <Container className="py-4">
      <h1 className="text-center mb-3">📊 Live Stock Dashboard</h1>
      <p className="text-center mb-4">Explore live insights and data-driven recommendations.</p>

      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" />
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {recommended && (
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Card.Title>🌟 Recommended Stock</Card.Title>
                <Row>
                  <Col><strong>Company:</strong> {recommended.company_name}</Col>
                  <Col><strong>Symbol:</strong> {recommended.stock_symbol}</Col>
                  <Col><strong>Price:</strong> ₹{recommended.price}</Col>
                  <Col><strong>Profit:</strong> ₹{recommended.profit ?? "-"}</Col>
                  <Col><strong>Loss:</strong> ₹{recommended.loss ?? "-"}</Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* 📰 News Headlines Section */}
          <h4 className="mt-4">📰 Related Headlines</h4>
          {newsLoading ? (
            <div className="text-muted">Loading news...</div>
          ) : news.length > 0 ? (
            <ul>
              {news.map((article, index) => (
                <li key={index}>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.title} <small>({article.source})</small>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No news available.</p>
          )}

          <Form.Control
            type="text"
            placeholder="🔍 Search stocks by company or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <h4 className="mb-3">📋 All Stocks</h4>
          {filteredStocks.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Company</th>
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>Profit</th>
                  <th>Loss</th>
                  <th>Sentiment</th>
                  <th>Trend</th>
                  <th>Chart</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => (
                  <tr key={stock.stock_symbol}>
                    <td>{stock.company_name}</td>
                    <td>{stock.stock_symbol}</td>
                    <td>₹{stock.price}</td>
                    <td>₹{stock.profit ?? "-"}</td>
                    <td>₹{stock.loss ?? "-"}</td>
                    <td>{renderSentiment(stock.sentiment)}</td>
                    <td>{renderTrend(stock.trend)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => fetchChart(stock.stock_symbol)}
                      >
                        View Chart
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No stocks found.</p>
          )}

          <h4 className="mt-5">📈 Sentiment Overview</h4>
          {sentimentGraphUrl && (
            <img
              src={sentimentGraphUrl}
              alt="Sentiment Graph"
              className="img-fluid mt-2 border"
            />
          )}

          {chartUrl && (
            <>
              <h4 className="mt-5">📉 7-Day Price Chart</h4>
              <img
                src={chartUrl}
                alt="Stock Chart"
                className="img-fluid mt-2 border"
              />
            </>
          )}
        </>
      )}
    </Container>
  );
}

export default Dashboard;
