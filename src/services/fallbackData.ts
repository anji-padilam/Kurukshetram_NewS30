// Fallback data for when external API is down
export interface FallbackNewsData {
  state_id: string;
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  shortNewsContent: string;
  longNewsContent: {
    content: string;
  };
  language_id: string;
  editorId: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  district_id: string;
  seoMeta: string | null;
  metaDescription: string | null;
  status: string;
  type: string;
  priority: string;
  isSticky: boolean;
  isFeatured: boolean;
  viewCount: number;
  uniqueViewCount: number;
  likeCount: number;
  dislikeCount: number;
  shareCount: number;
  commentCount: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  expiresAt: string | null;
  readTime: number | null;
  source: string | null;
  sourceUrl: string | null;
  isApproved: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  lastModifiedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  media: Array<{
    id: string;
    mediaType: string;
    mediaUrl: string;
    caption: string;
  }>;
  categoryName: string;
  districtName: string;
  stateName: string;
  languageName: string;
}

export const getFallbackNewsData = (newsId: string): FallbackNewsData => {
  return {
    state_id: "1",
    id: newsId,
    title: "Loading News Article...",
    slug: "news-service-unavailable",
    excerpt: "The news service is currently experiencing technical difficulties. Please try again later.",
    shortNewsContent: "The news service is currently experiencing technical difficulties. Please try again later.",
    longNewsContent: {
      content: `
        <div style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #007bff; margin-bottom: 15px;">📰 Loading News Article</h2>
          <p style="color: #6c757d; margin-bottom: 15px;">
            We're currently experiencing technical difficulties with our news service. 
            Our team is working to resolve this issue as quickly as possible.
          </p>
          <p style="color: #6c757d; margin-bottom: 20px;">
            Please try refreshing the page in a few minutes, or check back later.
          </p>
          <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #495057;">
              <strong>What you can do:</strong><br>
              • Refresh the page<br>
              • Check your internet connection<br>
              • Try again in a few minutes<br>
              • Contact support if the issue persists
            </p>
          </div>
        </div>
      `
    },
    language_id: "1",
    editorId: "1",
    authorId: "1",
    authorName: "System Administrator",
    categoryId: "1",
    district_id: "1",
    seoMeta: "News service unavailable - Service temporarily down",
    metaDescription: "The news service is currently experiencing technical difficulties. Please try again later.",
    status: "published",
    type: "news",
    priority: "normal",
    isSticky: false,
    isFeatured: false,
    viewCount: 0,
    uniqueViewCount: 0,
    likeCount: 0,
    dislikeCount: 0,
    shareCount: 0,
    commentCount: 0,
    publishedAt: new Date().toISOString(),
    scheduledAt: null,
    expiresAt: null,
    readTime: 2,
    source: "System",
    sourceUrl: null,
    isApproved: true,
    approvedAt: new Date().toISOString(),
    approvedBy: "system",
    lastModifiedBy: "system",
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    media: [
      {
        id: "fallback-media-1",
        mediaType: "image",
        mediaUrl: "/placeholder.svg",
        caption: "News service unavailable"
      }
    ],
    categoryName: "General",
    districtName: "Unknown",
    stateName: "Unknown",
    languageName: "English"
  };
};