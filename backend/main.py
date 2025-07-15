from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import yfinance as yf
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ---------- Config ----------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ---------- Models ----------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

with app.app_context():
    db.create_all()

# ---------- Constants ----------
WATCHLIST = ["AAPL", "GOOGL", "TSLA", "MSFT", "AMZN", "META", "NVDA", "NFLX", "TCS.NS", "INFY.NS"]
NEWSAPI_KEY = "76b17cd81bd04ead953fb405048ca892"  # Replace with your own key if needed

# ---------- Helper: Stock Info ----------
def get_stock_data(symbol):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        current_price = info.get("currentPrice")
        previous_close = info.get("previousClose")

        if not current_price or not previous_close:
            return None

        profit = round(current_price - previous_close, 2)
        loss = round(previous_close - current_price, 2) if profit < 0 else 0
        trend = "Uptrend" if profit > 0 else "Downtrend" if loss > 0 else "Neutral"
        sentiment = "Positive" if profit > 2 else "Negative" if loss > 2 else "Neutral"

        return {
            "company_name": info.get("shortName") or symbol,
            "stock_symbol": symbol,
            "price": current_price,
            "profit": profit if profit > 0 else None,
            "loss": loss if profit < 0 else None,
            "trend": trend,
            "sentiment": sentiment
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

# ---------- Routes ----------
@app.route('/')
def home():
    return "✅ Backend is running with yFinance, Auth & NewsAPI!"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409

    hashed_password = generate_password_hash(password)
    user = User(username=username, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'message': 'Invalid username or password'}), 401

@app.route('/stocks', methods=['GET'])
def get_stocks():
    result = []
    for symbol in WATCHLIST:
        stock_data = get_stock_data(symbol)
        if stock_data:
            result.append(stock_data)
    return jsonify({'stocks': result}), 200

@app.route('/stock/<symbol>', methods=['GET'])
def get_dynamic_stock(symbol):
    stock_data = get_stock_data(symbol.upper())
    if not stock_data:
        return jsonify({'error': 'Stock not found or data unavailable'}), 404
    return jsonify(stock_data), 200

@app.route('/recommend', methods=['GET'])
def recommend_stock():
    best = None
    for symbol in WATCHLIST:
        stock = get_stock_data(symbol)
        if stock:
            if not best or (stock["profit"] or 0) > (best["profit"] or 0):
                best = stock
    if not best:
        return jsonify({'message': 'No recommended stock found'}), 404
    return jsonify({'recommended': best}), 200

@app.route('/price-change-graph', methods=['GET'])
def price_change_graph():
    price_changes = []
    labels = []

    for symbol in WATCHLIST:
        stock = get_stock_data(symbol)
        if stock:
            profit = stock.get("profit") or -stock.get("loss", 0)
            price_changes.append(profit)
            labels.append(symbol)

    plt.figure(figsize=(10, 5))
    plt.bar(labels, price_changes, color=['green' if p >= 0 else 'red' for p in price_changes])
    plt.title("Price Change Since Previous Close")
    plt.xlabel("Stock Symbol")
    plt.ylabel("Price Change ($)")
    plt.xticks(rotation=45)

    static_folder = os.path.join(app.root_path, 'static')
    os.makedirs(static_folder, exist_ok=True)
    path = os.path.join(static_folder, 'price_change_chart.png')
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    return jsonify({'graph_url': '/static/price_change_chart.png'}), 200

@app.route('/stock-history/<symbol>', methods=['GET'])
def stock_history(symbol):
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period="7d")

        if hist.empty:
            return jsonify({'error': 'No historical data found'}), 404

        plt.figure(figsize=(8, 4))
        plt.plot(hist.index, hist['Close'], marker='o', linestyle='-', color='blue')
        plt.title(f"{symbol.upper()} - Last 7 Days Closing Price")
        plt.xlabel("Date")
        plt.ylabel("Close Price")
        plt.grid(True)

        static_folder = os.path.join(app.root_path, 'static')
        os.makedirs(static_folder, exist_ok=True)
        graph_path = os.path.join(static_folder, f"history_{symbol}.png")
        plt.savefig(graph_path)
        plt.close()
        return jsonify({'graph_url': f"/static/history_{symbol}.png"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ General business headlines
@app.route('/news', methods=['GET'])
def get_general_news():
    try:
        url = f"https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey={NEWSAPI_KEY}"
        response = requests.get(url)
        data = response.json()

        if response.status_code != 200 or data.get("status") != "ok":
            return jsonify({'error': 'Failed to fetch news'}), 500

        headlines = [
            {
                "title": article["title"],
                "url": article["url"],
                "source": article["source"]["name"]
            }
            for article in data["articles"]
        ]
        return jsonify({'news': headlines}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Symbol-specific news
@app.route('/news/<symbol>', methods=['GET'])
def get_stock_news(symbol):
    try:
        url = f"https://newsapi.org/v2/everything?q={symbol}&language=en&pageSize=5&apiKey={NEWSAPI_KEY}"
        headers = {"User-Agent": "Mozilla/5.0"}

        response = requests.get(url, headers=headers)
        data = response.json()

        news_list = []
        for article in data.get("articles", []):
            news_list.append({
                "title": article.get("title"),
                "url": article.get("url"),
                "source": article.get("source", {}).get("name", "")
            })

        return jsonify({"news": news_list}), 200
    except Exception as e:
        print("News fetch error:", e)
        return jsonify({"error": "Failed to fetch news"}), 500

# ---------- Run ----------
if __name__ == '__main__':
    app.run(debug=True)
