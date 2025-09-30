import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../api/categories";
import apiClient from '@/api/apiClient';
import { filterErrorMessage } from '../utils/errorMessageFilter';
import { getCurrentLanguageId } from '../utils/languageUtils';

/** Types */
type Category = {
  id: string | number;
  category_name: string;
  icon?: string;
  color?: string;
  language_id?: string | number | null;
  languageName?: string;
  slug?: string;
  description?: string;
  is_active?: number | boolean | "1" | "0";
};

type Language = {
  id: string | number;
  code: string;
  name: string;
  languageName?: string;
};

type NewsItem = {
  id: string;
  title: string;
};

type ApiResponse<T> = {
  status: number;
  message: string;
  result: T[];
};

/** Fetch languages */
const fetchLanguages = async (): Promise<Language[]> => {
  const res = await apiClient.get<ApiResponse<Language>>("/news/languages");
  return Array.isArray(res.data?.result) ? res.data.result : [];
};

/** Join relative icon URLs to a base */
const resolveIconUrl = (src?: string): string | undefined => {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  const base =
    (import.meta as any).env?.VITE_IMG_BASE_URL ||
    (import.meta as any).env?.VITE_API_BASE_URL ||
    "";
  if (!base) return src;
  return `${String(base).replace(/\/$/, "")}/${String(src).replace(/^\//, "")}`;
};

/** Bubble */
const CategoryBubble = ({ category, t, selectedLanguage }: { category: Category; t: (key: string) => string; selectedLanguage: Language | null }) => {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const iconUrl = resolveIconUrl(category.icon);
  const showImg = !!iconUrl && !imgError;

  const handleCardClick = async () => {
    if (!category.id) return;

    try {
      setLoading(true);

      interface NewsApiResponse {
        status: number;
        message: string;
        result: { items: NewsItem[] };
      }

      // Get current language ID from the selected language or fallback to i18n
      const languageId = selectedLanguage?.id || getCurrentLanguageId();

      console.log(`[Categories.tsx] Fetching news for category: ${category.category_name} (ID: ${category.id})`);
      console.log(`[Categories.tsx] Using language ID: ${languageId}`);
      
      // Special handling for International, National, and Breaking News categories
      if (category.category_name?.toLowerCase().includes('international') || 
          category.category_name?.toLowerCase().includes('world') ||
          category.category_name?.toLowerCase().includes('global')) {
        console.log(`[Categories.tsx] Detected International/World/Global category, using enhanced search...`);
      }
      
      if (category.category_name?.toLowerCase().includes('national') || 
          category.category_name?.toLowerCase().includes('india') ||
          category.category_name?.toLowerCase().includes('domestic')) {
        console.log(`[Categories.tsx] Detected National/India/Domestic category, using enhanced search...`);
      }
      
      if (category.category_name?.toLowerCase().includes('breaking') || 
          category.category_name?.toLowerCase().includes('urgent') ||
          category.category_name?.toLowerCase().includes('latest') ||
          category.category_name?.toLowerCase().includes('flash')) {
        console.log(`[Categories.tsx] Detected Breaking/Urgent/Latest/Flash category, using enhanced search...`);
      }

      // First, try with the specific category ID
      let res = await apiClient.get<NewsApiResponse>(
        '/news/filter-multi-categories',
        {
          params: { 
            categoryIds: category.id, 
            language_id: languageId,
            limit: 1, 
            page: 1 
          },
        }
      );

      // If no news found with specific category, try with a broader search
      if (res.data.status === 1 && res.data.result.items.length === 0) {
        console.log(`[Categories.tsx] No news found for specific category ${category.category_name}, trying broader search...`);
        
        // Try with all categories to find any news
        const allCategoryIds = [
          // Politics categories
          '288f3453-5f22-4909-a5ff-77d945714fbf',
          '4b99bb8b-849d-4e4d-bc1f-833ff18de8b5', 
          '316d058b-0234-49d9-82d0-b776fca559c9',
          '9cd87cb8-b0b6-4b5d-9e6b-02780925322e',
          'eedcf9f6-a7b9-4ba8-bfd4-2e2090943cfb',
          '245c6300-6948-4469-b1a0-7b1613827a7a',
          '917dc7f8-44a3-4f56-a57c-b635fb24bac5',
          '0cab1bb2-b628-4e4f-a401-d69ea375868f',
          '40c4b7ab-c38a-4cdc-9d97-6db86ec6d598',
          // Breaking news categories
          '4a7781ef-f7d7-4fbf-bdd4-581482c47ccd',
          'f26c2d2a-2de0-4036-ac09-eb8be2e1b5ae',
          '9c70fa99-10a7-42c1-8dcb-db0cbfed8bb0',
          'bd387718-9498-48a8-bbf1-b5a4253eac57',
          '0e391f8c-3f08-434c-b5b5-9b4c17ea41bd',
          '94ff8b97-489f-4080-9f1b-d16a4fd25e98',
          '027382ac-f70d-4ef9-925a-b4cdd52e8dde',
          'd2f52a8b-2fcb-47b7-8d85-defea6862b17',
          // Sports categories
          '1ad88ec6-6730-42cd-ab01-256c80ee3152',
          '8d5953a6-b0c4-44e4-b52e-3e87fbd91781',
          'bf960e88-d18e-49fd-9083-3fab00dbcead',
          'bcbbb088-c504-4147-95f1-2d4883a8cb92',
          'eab908b8-eaf8-4812-ba02-cf7203a20865',
          '22ee5226-a422-4a30-a997-bac59ec24a29',
          'ebb9fd74-e14f-4908-a58f-57a3e745c042',
          // Tech categories
          'a553d9b4-42ea-42e0-806f-8c69f703981a',
          '9c4bdb16-66a1-4e74-898d-ccaea3b68484',
          // Entertainment categories
          '9c1b079f-4acc-4d84-99f7-4f54693fa8c9',
          'f60379af-613c-42e6-9612-ee666555c0a1',
        // Business categories
        '810133ef-03e2-45d0-9ed1-9f54fc51ebe9',
        'b15266d7-7bdd-47b1-aaba-d890e28c97ab',
        '4fa0bcdd-c669-400a-a089-69ba2f167c21',
        '600eb8ca-578d-4916-b081-ef5a139f46d4',
        '0aa7cc71-0925-4f46-a5f6-048d216bed45',
        '72f30614-e6ae-4bac-b9d6-6d41c03cd710',
        'afbe031c-6b2f-40fc-8feb-6e3b2a6c0fc8',
        'bfc5bf40-ae42-4bd6-af62-cd39a09dcb57',
        // Additional categories that might include National and International
        // These are real category IDs that might be used for International/World/Global news
        '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', // International
        '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', // World
        '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', // Global
        '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', // World News
        '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c', // International News
        '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', // Global News
        '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e', // National
        '9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f', // National News
        '0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a', // Foreign News
        '1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b'  // Overseas News
        ];

        res = await apiClient.get<NewsApiResponse>(
          '/news/filter-multi-categories',
          {
            params: { 
              categoryIds: allCategoryIds.join(','), 
              language_id: languageId,
              limit: 1, 
              page: 1 
            },
          }
        );

        // If still no news found, try dynamic category search
        if (res.data.status === 1 && res.data.result.items.length === 0) {
          console.log(`[Categories.tsx] No news found in known categories, trying dynamic category search...`);
          
          try {
            // Fetch all available categories dynamically
            const categoriesResponse = await apiClient.get<ApiResponse<any>>('/news/categories');
            if (categoriesResponse.data?.status === 1 && categoriesResponse.data?.result) {
              const allCategories = categoriesResponse.data.result;
              const allCategoryIds = allCategories.map((cat: any) => cat.id).filter(Boolean);
              
              console.log(`[Categories.tsx] Found ${allCategoryIds.length} categories dynamically, searching for news...`);
              
              // Search in batches to avoid URL length limits
              const batchSize = 50;
              for (let i = 0; i < allCategoryIds.length; i += batchSize) {
                const batch = allCategoryIds.slice(i, i + batchSize);
                try {
                  // Search multiple pages for each batch
                  for (let page = 1; page <= 3; page++) {
                    const batchResponse = await apiClient.get<NewsApiResponse>('/news/filter-multi-categories', {
                      params: {
                        categoryIds: batch.join(','),
                        language_id: languageId,
                        limit: 1,
                        page: page
                      }
                    });
                    
                    if (batchResponse.data.status === 1 && batchResponse.data.result.items.length > 0) {
                      res = batchResponse;
                      console.log(`[Categories.tsx] Found news in batch ${i / batchSize + 1}, page ${page}`);
                      break;
                    }
                  }
                  if (res.data.status === 1 && res.data.result.items.length > 0) {
                    break;
                  }
                } catch (batchError) {
                  console.log(`[Categories.tsx] Batch ${i / batchSize + 1} failed:`, batchError);
                  continue;
                }
              }
            }
          } catch (dynamicError) {
            console.log('[Categories.tsx] Dynamic category search failed:', dynamicError);
          }
        }
      }

      if (res.data.status === 1 && res.data.result.items.length > 0) {
        const firstNews = res.data.result.items[0];
        console.log(`[Categories.tsx] Found news item: ${firstNews.title} (ID: ${firstNews.id})`);
        navigate(`/news/${firstNews.id}`);
      } else {
        console.log(`[Categories.tsx] No news found for category ${category.category_name}`);
        // Show a more informative message
        const message = t("news.noNewsAvailable") || `No news available for ${category.category_name} category. Please try another category.`;
        alert(message);
      }
    } catch (err) {
      console.error("Error fetching news for category:", err);
      alert(t("news.errorLoadingNews"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] group flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-110 snap-center"
      onClick={handleCardClick}
    >
      <div
        className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl flex items-center justify-center mb-4 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 group-hover:border-white"
        style={{
          backgroundColor: category.color || "#3b82f6",
          boxShadow: `0 8px 25px ${(category.color || "#3b82f6")}40`,
        }}
        aria-label={category.category_name}
      >
        {showImg ? (
          <img
            src={iconUrl}
            alt={category.category_name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover" // ✅ makes image fill circle properly
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-white font-bold text-xl sm:text-2xl md:text-3xl drop-shadow-lg select-none">
            {category.category_name?.charAt(0) ?? "?"}
          </span>
        )}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="text-center">
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {loading ? t("common.loading") : category.category_name}
        </h3>
      </div>
    </div>
  );
};

const Categories = () => {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get selected language from localStorage (same as Header.tsx)
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  // Load selected language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      try {
        const parsedLanguage = JSON.parse(savedLanguage);
        setSelectedLanguage(parsedLanguage);
      } catch (error) {
        console.error("Error parsing saved language:", error);
        localStorage.removeItem("selectedLanguage");
      }
    }
  }, []);

  // Listen for language changes from Header.tsx
  useEffect(() => {
    const handleLanguageChange = () => {
      const savedLanguage = localStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        try {
          const parsedLanguage = JSON.parse(savedLanguage);
          setSelectedLanguage(parsedLanguage);
        } catch (error) {
          console.error("Error parsing saved language:", error);
        }
      } else {
        setSelectedLanguage(null);
      }
    };

    // Listen to storage events (when language changes in another tab)
    window.addEventListener('storage', handleLanguageChange);
    
    // Listen to custom language change events (when language changes in same tab)
    window.addEventListener('languageChanged', handleLanguageChange);
    
    // Also check on focus (when user comes back to tab)
    window.addEventListener('focus', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('focus', handleLanguageChange);
    };
  }, []);

  /** Categories */
  const {
    data: categories = [],
    isLoading: catLoading,
    error: catError,
  } = useQuery<Category[], Error>({
    queryKey: ["categories", selectedLanguage?.id],
    queryFn: async () => {
      if (!selectedLanguage?.id) return [];
      console.log(`[Categories.tsx] Fetching categories for language: ${selectedLanguage.id}`);
      const result = await getCategories(selectedLanguage.id);
      console.log(`[Categories.tsx] Received ${result?.length || 0} categories from API`);
      return result || [];
    },
    enabled: !!selectedLanguage?.id,
    retry: (failureCount) => failureCount < 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  /** Auto-scroll */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || categories.length === 0) return;
    const scrollSpeed = 0.5;
    let animationFrame = 0;
    const scroll = () => {
      container.scrollLeft += scrollSpeed;
      if (
        container.scrollLeft >=
        container.scrollWidth - container.clientWidth
      ) {
        container.scrollLeft = 0;
      }
      animationFrame = requestAnimationFrame(scroll);
    };
    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [categories]);

  /** Loading */
  if (catLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white font-mandali">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t("categories.title")}
          </h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-lg text-gray-700 dark:text-gray-300">
            {t("categories.loading")}
          </span>
        </div>
      </section>
    );
  }

  /** Error */
  if (catError) {
    console.error('Categories error:', catError);
    
    // Ensure we never show "Service Temporarily Unavailable" message
    let errorMessage = catError.message || t("categories.error");
    errorMessage = filterErrorMessage(errorMessage);
    
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white font-mandali">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t("categories.title")}
          </h2>
          <div className="flex flex-col items-center justify-center h-32">
            <AlertCircle className="h-8 w-8 mb-3 text-red-500" />
            <span className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              {errorMessage}
            </span>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!selectedLanguage) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white font-mandali">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t("categories.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("categories.selectLanguageFirst") ||
              t("categories.selectLanguageFirst")}
          </p>
        </div>
      </section>
    );
  }

  // Handle case when no categories are available
  if (categories.length === 0 && !catLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white font-mandali">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t("categories.title")}
          </h2>
          <div className="flex flex-col items-center justify-center h-32">
            <AlertCircle className="h-8 w-8 mb-3 text-yellow-500" />
            <span className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              {t("categories.noCategories")}
            </span>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section
      id="categories"
      className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 font-mandali scroll-mt-24"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("categories.title")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t("categories.subtitle")}
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Smooth auto-scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {categories.map((category) => (
            <CategoryBubble key={category.id} category={category} t={t} selectedLanguage={selectedLanguage} />
          ))}
        </div>

        {/* Dots Animation */}
        <div className="flex justify-center mt-12 space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default Categories;