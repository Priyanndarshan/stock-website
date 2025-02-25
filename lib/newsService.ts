const NEWS_API_KEY = process.env.NEWS_API_KEY; // Get a free API key from newsapi.org

export async function fetchStockNews(stockName: string) {
  try {
    // Clean up the stock name/symbol
    const cleanStockName = stockName.replace(/[^\w\s]/g, '').trim();
    
    // Try to extract symbol if it's in parentheses
    const symbolMatch = stockName.match(/\(([^)]+)\)/);
    const symbol = symbolMatch ? symbolMatch[1] : '';
    
    // Create search query combining name and symbol
    const searchQuery = symbol 
      ? `(${cleanStockName} OR ${symbol}) AND (stock OR shares OR trading)`
      : `${cleanStockName} AND (stock OR shares OR trading)`;

    const response = await fetch(
      `https://newsapi.org/v2/everything?` + 
      new URLSearchParams({
        q: searchQuery,
        sortBy: 'publishedAt',
        language: 'en',
        apiKey: NEWS_API_KEY!,
        pageSize: '5',
        domains: 'reuters.com,bloomberg.com,finance.yahoo.com,marketwatch.com,fool.com'
      })
    );

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Filter out articles that don't mention the stock name or symbol
    const relevantArticles = data.articles.filter((article: any) => {
      const content = (article.title + ' ' + article.description).toLowerCase();
      return content.includes(cleanStockName.toLowerCase()) || 
             (symbol && content.includes(symbol.toLowerCase()));
    });

    return relevantArticles.slice(0, 5); // Return up to 5 relevant articles
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
} 