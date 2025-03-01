import streamlit as st
import yfinance as yf
import plotly.graph_objects as go
import time

def get_stock_data(stock_symbol, period='1d', interval='1m'):
    stock = yf.Ticker(stock_symbol) 
    data = stock.history(period=period, interval=interval)
    return data

def plot_live_chart(data, stock_symbol):
    fig = go.Figure()
    fig.add_trace(go.Candlestick(
        x=data.index,
        open=data['Open'],
        high=data['High'],
        low=data['Low'],
        close=data['Close'],
        name='Candlestick'))
    
    fig.update_layout(
        title=f'Live Trading Chart: {stock_symbol.upper()}',
        xaxis_title='Time',
        yaxis_title='Price',
        xaxis_rangeslider_visible=False,
        template='plotly_dark'
    )
    return fig

def main():
    st.title("Live Trading Graph")
    stock_symbol = st.text_input("Enter Stock Symbol (e.g., AAPL, TSLA, MSFT):", "AAPL")
    
    st.write("Fetching live data...")
    chart_placeholder = st.empty()
    
    while True:
        data = get_stock_data(stock_symbol)
        if not data.empty:
            chart_placeholder.plotly_chart(plot_live_chart(data, stock_symbol), use_container_width=True)
        time.sleep(60)  # Refresh every 60 seconds

if __name__ == "__main__":
    main()
