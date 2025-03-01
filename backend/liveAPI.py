from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.route("/")
def home():
    return jsonify({"message": "Stock Data API is Running"})

@app.route("/get_stock_data", methods=["POST"])
def get_stock_data():
    try:
        data = request.json
        stock_symbol = data.get("symbol", "AAPL")
        period = data.get("period", "1d")
        interval = data.get("interval", "1m")
        compare_symbols = data.get("compareSymbols", [])
        
        logging.info(f"Received request for symbol: {stock_symbol}, period: {period}, interval: {interval}")
        if compare_symbols:
            logging.info(f"Comparison symbols: {compare_symbols}")
        
        # Get primary stock data
        stock = yf.Ticker(stock_symbol)
        stock_data = stock.history(period=period, interval=interval)
        news = [[n['content']['title'], n['content']['summary']] for n in stock.news]
        
        if stock_data.empty:
            logging.warning("No data found for the given parameters.")
            return jsonify({"error": "No data found"}), 404
        
        # Prepare the response with the primary stock data
        response = {
            "symbol": stock_symbol,
            "timestamps": stock_data.index.strftime('%Y-%m-%d %H:%M:%S').tolist(),
            "open": stock_data['Open'].tolist(),
            "high": stock_data['High'].tolist(),
            "low": stock_data['Low'].tolist(),
            "close": stock_data['Close'].tolist(),
            "volume": stock_data['Volume'].tolist() if 'Volume' in stock_data.columns else [],
            "news": news,
            "compareData": {}
        }
        
        # Get comparison stocks data
        for compare_symbol in compare_symbols:
            try:
                compare_stock = yf.Ticker(compare_symbol)
                compare_data = compare_stock.history(period=period, interval=interval)
                
                if not compare_data.empty:
                    response["compareData"][compare_symbol] = {
                        "close": compare_data['Close'].tolist(),
                        "lastPrice": compare_data['Close'].iloc[-1] if len(compare_data) > 0 else None,
                        "change": compare_data['Close'].iloc[-1] - compare_data['Close'].iloc[-2] if len(compare_data) > 1 else None,
                        "percentChange": ((compare_data['Close'].iloc[-1] - compare_data['Close'].iloc[-2]) / compare_data['Close'].iloc[-2] * 100) if len(compare_data) > 1 else None
                    }
                    logging.info(f"Successfully fetched comparison data for {compare_symbol}")
                else:
                    logging.warning(f"No data found for comparison symbol: {compare_symbol}")
            except Exception as e:
                logging.error(f"Error fetching data for {compare_symbol}: {str(e)}")
                response["compareData"][compare_symbol] = {"error": str(e)}
                
        return jsonify(response)
    except Exception as e:
        logging.error(f"Error occurred: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request."}), 500

@app.route("/get_stock_info", methods=["POST"])
def get_stock_info():
    try:
        data = request.json
        
        # Support both traditional format (main stock + compare stocks)
        # and a simple list of stocks to compare
        if "symbols" in data:
            # New format: just provide a list of symbols to compare
            symbols = data.get("symbols", ["AAPL"])
            main_symbol = symbols[0] if symbols else "AAPL"
            other_symbols = symbols[1:] if len(symbols) > 1 else []
            logging.info(f"Received request to compare multiple stocks: {symbols}")
        else:
            # Traditional format: main stock + comparison symbols
            main_symbol = data.get("symbol", "AAPL")
            other_symbols = data.get("compareSymbols", [])
            symbols = [main_symbol] + other_symbols
            logging.info(f"Received request for stock info: {main_symbol}")
            if other_symbols:
                logging.info(f"Comparison symbols for info: {other_symbols}")
        
        response = {
            "stocks": {},
            "comparativeMetrics": {}
        }
        
        # Get all stocks data
        market_caps = []
        pe_ratios = []
        dividend_yields = []
        sectors = {}
        industries = {}
        
        for symbol in symbols:
            try:
                stock = yf.Ticker(symbol)
                info = stock.info
                
                stock_data = {
                    "symbol": symbol,
                    "name": info.get("shortName", ""),
                    "sector": info.get("sector", ""),
                    "industry": info.get("industry", ""),
                    "marketCap": info.get("marketCap", 0),
                    "peRatio": info.get("trailingPE", 0),
                    "forwardPE": info.get("forwardPE", 0),
                    "dividendYield": info.get("dividendYield", 0) * 100 if info.get("dividendYield") else 0,
                    "targetPrice": info.get("targetMeanPrice", 0),
                    "recommendation": info.get("recommendationKey", ""),
                    "beta": info.get("beta", 0),
                    "dayHigh": info.get("dayHigh", 0),
                    "dayLow": info.get("dayLow", 0),
                    "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh", 0),
                    "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow", 0),
                    "averageVolume": info.get("averageVolume", 0),
                }
                
                response["stocks"][symbol] = stock_data
                
                # Collect data for comparative metrics
                if info.get("marketCap"):
                    market_caps.append((symbol, info.get("marketCap")))
                if info.get("trailingPE"):
                    pe_ratios.append((symbol, info.get("trailingPE")))
                if info.get("dividendYield"):
                    dividend_yields.append((symbol, info.get("dividendYield") * 100))
                
                # Track sectors and industries
                sector = info.get("sector", "Unknown")
                industry = info.get("industry", "Unknown")
                
                if sector not in sectors:
                    sectors[sector] = []
                sectors[sector].append(symbol)
                
                if industry not in industries:
                    industries[industry] = []
                industries[industry].append(symbol)
                
                logging.info(f"Successfully fetched info for symbol: {symbol}")
            except Exception as e:
                logging.error(f"Error fetching info for {symbol}: {str(e)}")
                response["stocks"][symbol] = {"error": str(e)}
        
        # Add comparative metrics
        response["comparativeMetrics"] = {
            "marketCap": {
                "highest": max(market_caps, key=lambda x: x[1])[0] if market_caps else None,
                "lowest": min(market_caps, key=lambda x: x[1])[0] if market_caps else None,
            },
            "peRatio": {
                "highest": max(pe_ratios, key=lambda x: x[1])[0] if pe_ratios else None,
                "lowest": min(pe_ratios, key=lambda x: x[1])[0] if pe_ratios else None,
            },
            "dividendYield": {
                "highest": max(dividend_yields, key=lambda x: x[1])[0] if dividend_yields else None,
                "lowest": min(dividend_yields, key=lambda x: x[1])[0] if dividend_yields else None,
            },
            "sectorGroups": sectors,
            "industryGroups": industries
        }
        
        # Add original format for backward compatibility
        if "symbols" not in data:
            response["mainStock"] = response["stocks"].get(main_symbol, {})
            response["compareStocks"] = {symbol: response["stocks"].get(symbol, {}) for symbol in other_symbols}
        
        return jsonify(response)
    except Exception as e:
        logging.error(f"Error fetching stock info: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request."}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
