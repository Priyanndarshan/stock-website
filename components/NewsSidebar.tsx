import { Card } from "./ui/card";
import { ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  urlToImage?: string; // Optional image URL from the news API
}

interface NewsSidebarProps {
  stockName: string;
  news: NewsItem[];
}

export function NewsSidebar({ stockName, news }: NewsSidebarProps) {
  return (
    <div className="w-80 h-screen bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto fixed right-0 top-0">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <span>{stockName}</span>
          <span className="text-sm text-gray-400 font-normal">Latest News</span>
        </h2>
        
        <div className="space-y-3">
          {news.map((item, index) => (
            <a 
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform hover:scale-[1.02] focus:outline-none"
            >
              <Card className="bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-colors overflow-hidden group">
                {item.urlToImage && (
                  <div className="w-full h-32 overflow-hidden">
                    <img 
                      src={item.urlToImage} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <p className="text-gray-400 text-sm line-clamp-2 mt-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-blue-400 font-medium">
                      {item.source.name}
                    </span>
                    <span className="text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No recent news found for {stockName}
          </div>
        )}
      </div>
    </div>
  );
} 