import { useState, useEffect } from 'react';
import { getSingleNews } from '../api/apiSingleNews';

interface UseNewsWithFallbackResult {
  data: any | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

export const useNewsWithFallback = (newsId: string): UseNewsWithFallbackResult => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!newsId) {
      setError("No news ID provided");
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsFallback(false);

        const newsData = await getSingleNews(newsId);
        
        // Check if this is fallback data
        if (newsData.title === "Loading News Article...") {
          setIsFallback(true);
          console.log('Using fallback data - external API is down');
        }

        setData(newsData);
      } catch (err) {
        // This should rarely happen now due to fallback handling
        console.error('Unexpected error in useNewsWithFallback:', err);
        setError("Failed to load news article");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsId]);

  return { data, loading, error, isFallback };
};
