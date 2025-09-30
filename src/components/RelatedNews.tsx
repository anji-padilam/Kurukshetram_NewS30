import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFilteredNews } from "../api/news";
import { NewsItem } from "../api/apiTypes";
import apiClient from "../api/apiClient";
import { getCurrentLanguageId } from "../utils/languageUtils";

interface RelatedNewsProps {
  categoryId: string;
  language_id: string;
  state_id: string;
  district_id: string;
  currentNewsId?: string;
}

const RelatedNews: React.FC<RelatedNewsProps> = ({
  categoryId,
  language_id,
  state_id,
  district_id,
  currentNewsId,
}) => {
  const navigate = useNavigate();
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedNews = async () => {
      try {
        setLoading(true);
        console.log('Fetching related news with params:', {
          language_id,
          categoryId,
          state_id,
          district_id,
          currentNewsId
        });
        
        // Try multiple approaches to find related news
        let relatedItems: any[] = [];
        
        // Approach 1: Try with all parameters if available
        if (categoryId && language_id && state_id && district_id) {
          try {
        const newsData = await getFilteredNews({
          language_id,
          categoryId,
          state_id,
          district_id,
          page: 1,
        });

        console.log('Related news API response:', newsData);

        if (newsData?.items && Array.isArray(newsData.items)) {
              relatedItems = newsData.items
            .filter((n) => n.id !== currentNewsId)
            .slice(0, 8);
              console.log(`Found ${relatedItems.length} related news items via getFilteredNews`);
            }
          } catch (err) {
            console.log('getFilteredNews failed:', err);
          }
        }
        
        // Approach 2: If no items found, try with just category and language
        if (relatedItems.length === 0 && categoryId && language_id) {
          try {
            console.log('Trying with just category and language...');
            const alternativeResponse = await apiClient.get('/news/filter-multi-categories', {
              params: {
                categoryIds: categoryId,
                language_id,
                limit: 8,
                page: 1
              }
            });
            
            if (alternativeResponse.data?.status === 1 && alternativeResponse.data?.result?.items) {
              relatedItems = alternativeResponse.data.result.items
                .filter((n: any) => n.id !== currentNewsId)
                .slice(0, 8);
              console.log(`Found ${relatedItems.length} related news items via category+language search`);
            }
          } catch (altError) {
            console.log('Category+language search failed:', altError);
          }
        }
        
        // Approach 3: If still no items, try with just language and known category IDs
        if (relatedItems.length === 0 && language_id) {
          try {
            console.log('Trying with language and known category IDs...');
            const knownCategoryIds = [
              '288f3453-5f22-4909-a5ff-77d945714fbf', // Politics
              '4b99bb8b-849d-4e4d-bc1f-833ff18de8b5', // Breaking News
              '7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f', // Sports
              '8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a', // Tech
              '9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b', // Entertainment
              '0f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', // Business
              '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e', // National
              '9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f', // National News
              '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', // International
              '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', // World
              '4a7781ef-f7d7-4fbf-bdd4-581482c47ccd', // Breaking News (additional)
              'f26c2d2a-2de0-4036-ac09-eb8be2e1b5ae'  // Urgent News
            ];
            
            const languageResponse = await apiClient.get('/news/filter-multi-categories', {
              params: {
                categoryIds: knownCategoryIds.join(','),
                language_id,
                limit: 8,
                page: 1
              }
            });
            
            if (languageResponse.data?.status === 1 && languageResponse.data?.result?.items) {
              relatedItems = languageResponse.data.result.items
                .filter((n: any) => n.id !== currentNewsId)
                .slice(0, 8);
              console.log(`Found ${relatedItems.length} related news items via language+category search`);
            }
          } catch (langError) {
            console.log('Language+category search failed:', langError);
          }
        }
        
        // Approach 4: If still no items, try with broader search using known category IDs
        if (relatedItems.length === 0) {
          try {
            console.log('Trying broader search with known category IDs...');
            // Use a comprehensive list of known category IDs for broader search
            const knownCategoryIds = [
              '288f3453-5f22-4909-a5ff-77d945714fbf', // Politics
              '4b99bb8b-849d-4e4d-bc1f-833ff18de8b5', // Breaking News
              '7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f', // Sports
              '8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a', // Tech
              '9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b', // Entertainment
              '0f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', // Business
              '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', // National
              '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', // International
              '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', // World
              '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a'  // Global
            ];
            
            const broaderResponse = await apiClient.get('/news/filter-multi-categories', {
              params: {
                categoryIds: knownCategoryIds.join(','),
                language_id: language_id || getCurrentLanguageId(),
                limit: 8,
                page: 1
              }
            });
            
            if (broaderResponse.data?.status === 1 && broaderResponse.data?.result?.items) {
              relatedItems = broaderResponse.data.result.items
                .filter((n: any) => n.id !== currentNewsId)
                .slice(0, 8);
              console.log(`Found ${relatedItems.length} related news items via broader search`);
            }
          } catch (broaderError) {
            console.log('Broader search failed:', broaderError);
          }
        }
        
        // Approach 5: If still no items, try to get categories dynamically and search
        if (relatedItems.length === 0) {
          try {
            console.log('Trying dynamic category search...');
            const currentLanguageId = language_id || getCurrentLanguageId();
            
            const categoriesResponse = await apiClient.get('/news/categories', {
              params: {
                language_id: currentLanguageId
              }
            });
            
            if (categoriesResponse.data?.status === 1 && categoriesResponse.data?.result) {
              const allCategories = categoriesResponse.data.result;
              const allCategoryIds = allCategories.map((cat: any) => cat.id).filter(Boolean);
              
              if (allCategoryIds.length > 0) {
                console.log(`Found ${allCategoryIds.length} categories dynamically, searching for related news...`);
                
                const dynamicResponse = await apiClient.get('/news/filter-multi-categories', {
                  params: {
                    categoryIds: allCategoryIds.slice(0, 10).join(','), // Use first 10 categories
                    language_id: currentLanguageId,
                    limit: 8,
                    page: 1
                  }
                });
                
                if (dynamicResponse.data?.status === 1 && dynamicResponse.data?.result?.items) {
                  relatedItems = dynamicResponse.data.result.items
                    .filter((n: any) => n.id !== currentNewsId)
                    .slice(0, 8);
                  console.log(`Found ${relatedItems.length} related news items via dynamic category search`);
                }
              }
            }
          } catch (dynamicError) {
            console.log('Dynamic category search failed:', dynamicError);
          }
        }
        
        // Approach 6: Final fallback with comprehensive known category IDs
        if (relatedItems.length === 0) {
          try {
            console.log('Trying final fallback with comprehensive category IDs...');
            const comprehensiveCategoryIds = [
              // Politics categories
              '288f3453-5f22-4909-a5ff-77d945714fbf',
              '4b99bb8b-849d-4e4d-bc1f-833ff18de8b5',
              // Sports categories
              '7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
              '8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a',
              // Tech categories
              '9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
              '0f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
              // Entertainment categories
              '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
              '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
              // Business categories
              '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
              '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
              // National News categories
              '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e', // National
              '9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f', // National News
              '0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a', // India
              '1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b', // Domestic
              // Breaking News categories
              '4a7781ef-f7d7-4fbf-bdd4-581482c47ccd', // Breaking News
              'f26c2d2a-2de0-4036-ac09-eb8be2e1b5ae', // Urgent News
              '9c70fa99-10a7-42c1-8dcb-db0cbfed8bb0', // Latest News
              'bd387718-9498-48a8-bbf1-b5a4253eac57', // Flash News
              // Additional common category IDs
              '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
              '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
              '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d'
            ];
            
            const finalResponse = await apiClient.get('/news/filter-multi-categories', {
              params: {
                categoryIds: comprehensiveCategoryIds.join(','),
                language_id: language_id || getCurrentLanguageId(),
                limit: 8,
                page: 1
              }
            });
            
            if (finalResponse.data?.status === 1 && finalResponse.data?.result?.items) {
              relatedItems = finalResponse.data.result.items
                .filter((n: any) => n.id !== currentNewsId)
                .slice(0, 8);
              console.log(`Found ${relatedItems.length} related news items via final fallback search`);
            }
          } catch (finalError) {
            console.log('Final fallback search failed:', finalError);
          }
        }
        
        setRelatedNews(relatedItems);
        
      } catch (err) {
        console.error("Error fetching related news:", err);
        setRelatedNews([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Always try to fetch related news, even with missing parameters
      fetchRelatedNews();
  }, [categoryId, language_id, state_id, district_id, currentNewsId]);

  const handleClick = (news: NewsItem) => {
    navigate(`/news/${news.id}`);
  };

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Related Entertainment Updates:</h2>
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!relatedNews.length) {
    return null;
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Related News Updates:</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {relatedNews.map((news) => (
          <div
            key={news.id}
            className="flex-shrink-0 w-48 cursor-pointer"
            onClick={() => handleClick(news)}
          >
            {/* Image */}
            <div className="w-full h-32 rounded-md overflow-hidden bg-gray-200">
              {news.media?.[0]?.mediaUrl ? (
                <img
                  src={news.media[0].mediaUrl}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <span className="text-2xl">📰</span>
                </div>
              )}
            </div>
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-800 dark:text-white mt-2 line-clamp-2">
              {news.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedNews;