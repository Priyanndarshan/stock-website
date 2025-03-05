# client/plot_stock.py
import requests
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from datetime import datetime

ticker = input("Enter the stock symbol (e.g., AAPL, TSLA, RELIANCE.NS): ")
time_interval = input("Enter the time interval (e.g., 5y, 1y, 1d): ")
url = f'http://127.0.0.1:5000/stock/{ticker}?interval={time_interval}'

fig, ax = plt.subplots(facecolor='black')
times, prices = [], []

# Fetch and plot historical data
response = requests.get(url)
data = response.json()
if "error" not in data:
    times = [entry['Time'] for entry in data]  # Extract times from the data
    prices = [entry['Close'] for entry in data]  # Extract closing prices from the data
    ax.plot(times, prices, color='white')  # Set line color to white

# Function to fetch and plot live data
def fetch_live_data():
    response = requests.get(url)
    data = response.json()
    if "error" not in data:
        times = [entry['Time'] for entry in data]
        prices = [entry['Close'] for entry in data]
        ax.clear()
        ax.set_facecolor('black')
        ax.plot(times, prices, color='white')  # Set line color to white
        ax.tick_params(axis='x', colors='white')
        ax.tick_params(axis='y', colors='white')
        plt.xticks(rotation=45, ha='right', color='white')
        plt.subplots_adjust(bottom=0.30)
        plt.title(f'Stock Price for {ticker} over {time_interval}', color='white')
        plt.ylabel('Price (₹)', color='white')

# Update the animation function to call fetch_live_data
def animate(i):
    fetch_live_data()

ani = animation.FuncAnimation(fig, animate, interval=60000)  # Update every minute
plt.show()