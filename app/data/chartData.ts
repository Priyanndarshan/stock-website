export interface ChartInsight {
  trend: {
    direction: 'Bearish' | 'Bullish' | 'Neutral';
    strength: string;
    probability: number;
  };
  volatility: {
    level: 'Low' | 'Medium' | 'High';
    value: string;
    historicalAvg: string;
  };
  volume: {
    level: 'Low' | 'Medium' | 'High';
    value: string;
    change: string;
  };
  sentiment: {
    status: 'Oversold' | 'Overbought' | 'Neutral';
    value: string;
    momentum: string;
  };
}

export interface GamePlan {
  strategy: string;
  supportLevel: number;
  resistanceLevel: number;
  stopLoss: number;
  riskReward: string;
}

export interface Forecast {
  shortTerm: {
    prediction: string;
    probability: number;
    targetPrice: number;
    timeframe: string;
  };
  mediumTerm: {
    prediction: string;
    probability: number;
    targetPrice: number;
    timeframe: string;
  };
  keyLevels: {
    resistance: number[];
    support: number[];
  };
}

export interface Statistics {
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
    trend: 'Bullish' | 'Bearish' | 'Neutral';
  };
  oscillators: {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    stochastic: {
      k: number;
      d: number;
    };
  };
}

export interface ChartAnalysis {
  keyInsights: ChartInsight;
  gamePlan: GamePlan;
  forecast: Forecast;
  statistics: Statistics;
  supportZones: number[];
}

export const getChartAnalysis = (imageUrl: string): ChartAnalysis => {
  // In a real application, this would make an API call to analyze the chart
  // For now, returning mock data
  return {
    keyInsights: {
      trend: {
        direction: 'Bearish',
        strength: 'Strong',
        probability: 78.5
      },
      volatility: {
        level: 'Medium',
        value: '2.5%',
        historicalAvg: '1.8%'
      },
      volume: {
        level: 'Medium',
        value: '1.2M',
        change: '+15.3%'
      },
      sentiment: {
        status: 'Oversold',
        value: '28',
        momentum: 'Decreasing'
      }
    },
    gamePlan: {
      strategy: "Utilize the current pullback near key support as an entry opportunity for short to medium-term gains. Monitor the support zone for potential reversal signals.",
      supportLevel: 47898.35,
      resistanceLevel: 48353.57,
      stopLoss: 46128.60,
      riskReward: "2:1"
    },
    forecast: {
      shortTerm: {
        prediction: "Bearish Reversal",
        probability: 75,
        targetPrice: 46500.00,
        timeframe: "1-3 days"
      },
      mediumTerm: {
        prediction: "Bullish Recovery",
        probability: 65,
        targetPrice: 49200.00,
        timeframe: "1-2 weeks"
      },
      keyLevels: {
        resistance: [48353.57, 48900.00, 49500.00],
        support: [47898.35, 47123.45, 46789.20]
      }
    },
    statistics: {
      movingAverages: {
        sma20: 48150.25,
        sma50: 47890.15,
        sma200: 46750.80,
        trend: 'Bearish'
      },
      oscillators: {
        rsi: 28.5,
        macd: {
          value: -45.2,
          signal: -42.8,
          histogram: -2.4
        },
        stochastic: {
          k: 15.5,
          d: 18.2
        }
      }
    },
    supportZones: [47898.35, 47123.45, 46789.20]
  };
}; 