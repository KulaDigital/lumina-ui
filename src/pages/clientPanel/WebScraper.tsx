import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/instance';

interface ScrapedUrl {
  url: string;
  pageTitle: string;
  totalChunks: number;
  wordCount: number;
  scrapedAt: string;
}

const WebScraper: React.FC = () => {
  const [urls, setUrls] = useState<ScrapedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescrapingUrl, setRescrapingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchScrapedUrls();
  }, []);

  const fetchScrapedUrls = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch content list (URLs and metadata)
      const contentResponse = await axiosInstance.get('/scraper/content');
      const contentList = contentResponse.data.content || [];
      
      // Fetch chunk statistics (word counts and stats)
      const statsResponse = await axiosInstance.get('/scraper/chunk-stats');
      const statsData = statsResponse.data || {};
      const urlStats = statsData.urlStats || {};

      // Combine content and stats data
      const scrapedUrls: ScrapedUrl[] = contentList.map((item: any) => {
        const stats = urlStats[item.url] || {};
        return {
          url: item.url,
          pageTitle: item.pageTitle || stats.pageTitle || 'Untitled',
          totalChunks: item.totalChunks || stats.chunkCount || 0,
          wordCount: stats.wordCount || 0,
          scrapedAt: item.scrapedAt || new Date().toISOString(),
        };
      });

      setUrls(scrapedUrls);
    } catch (err) {
      console.error('Error fetching scraped URLs:', err);
      // Handle 403 Forbidden gracefully
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status: number } };
        if (error.response?.status === 403) {
          setError('You do not have access to this content.');
        } else {
          setError('Failed to load scraped content. Please try again.');
        }
      } else {
        setError('Failed to load scraped content. Please try again.');
      }
      setUrls([]);
    } finally {
      setLoading(false);
    }
  };

  const generateEmbeddingsForUrl = async (url: string) => {
    try {
      console.log('[WebScraper] Regenerating embeddings for URL:', url);
      
      const response = await axiosInstance.post(
        '/embeddings/regenerate',
        { url }
      );

      console.log('[WebScraper] Embeddings response:', response.data);
      
      if (response.data.success) {
        console.log('[WebScraper] Embeddings regenerated successfully');
        return response.data;
      } else {
        console.error('[WebScraper] Embeddings regeneration failed:', response.data);
        throw new Error(response.data.error || 'Failed to generate embeddings');
      }
    } catch (err) {
      console.error('[WebScraper] Error regenerating embeddings:', err);
      throw err;
    }
  };

  const handleRescrape = async (url: string) => {
    try {
      setRescrapingUrl(url);
      setError(null);
      setSuccessMessage(null);

      // POST /api/scraper/scrape-batch with { urls: [url] }
      const response = await axiosInstance.post('/scraper/scrape-batch', {
        urls: [url],
      });

      if (response.data.successCount > 0) {
        // First, show scraping success
        setSuccessMessage(
          `✓ Successfully updated ${response.data.results?.[0]?.chunksCreated || 1} chunks for this page`
        );
        
        // Then regenerate embeddings for the specific URL
        try {
          console.log('[WebScraper] Calling regenerate embeddings for URL:', url);
          await generateEmbeddingsForUrl(url);
          
          // Show final success message with embedding info
          setSuccessMessage(
            `✓ Successfully updated and embedded content for this page`
          );
        } catch (embeddingErr) {
          console.error('[WebScraper] Embeddings generation error:', embeddingErr);
          // Even if embeddings fail, show that scraping succeeded
          setSuccessMessage(
            `✓ Content updated but embedding generation failed. Please try again.`
          );
        }
        
        // Refresh the list after slight delay to allow backend to update
        setTimeout(() => fetchScrapedUrls(), 500);
        // Clear success message after 4 seconds
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError('Failed to rescrape URL. Please try again.');
      }
    } catch (err) {
      console.error('Error rescraaping URL:', err);
      setError('Failed to rescrape URL. Please try again.');
    } finally {
      setRescrapingUrl(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="gap-5 pb-20">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-text-primary font-heading text-3xl font-bold">
          Web Scraper
        </h1>
        <p className="text-text-secondary font-body text-sm mt-1">
          Manage and update your website content for the knowledge base
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 mb-5">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-5">
          {error}
        </div>
      )}

      {/* Content Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-text-secondary text-sm">Loading scraped content...</p>
          </div>
        ) : urls.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-text-secondary text-sm">
              No scraped content yet. Start by adding URLs to scrape.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-bg-light border-b border-[var(--color-border)]">
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      URL
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Title
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Chunks
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Words
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Last Updated
                    </span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {urls.map((urlItem, _idx) => (
                  <tr
                    key={urlItem.url}
                    className="border-b border-[var(--color-border)] hover:bg-bg-light transition-colors"
                  >
                    {/* URL */}
                    <td className="px-6 py-4">
                      <a
                        href={urlItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        title={urlItem.url}
                      >
                        {truncateUrl(urlItem.url)}
                      </a>
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-primary">
                        {urlItem.pageTitle || '-'}
                      </span>
                    </td>

                    {/* Chunks */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {urlItem.totalChunks}
                      </span>
                    </td>

                    {/* Words */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-text-secondary font-medium">
                        {urlItem.wordCount.toLocaleString()}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {formatDate(urlItem.scrapedAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRescrape(urlItem.url)}
                        disabled={rescrapingUrl === urlItem.url}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Rescrape this URL to update content"
                      >
                        {rescrapingUrl === urlItem.url ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span>
                            Updating...
                          </>
                        ) : (
                          <>
                            ↻ Rescrape
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Stats */}
        {!loading && urls.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] bg-bg-light">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">
                {urls.length} page{urls.length !== 1 ? 's' : ''} ·{' '}
                <span className="text-text-secondary">
                  {urls.reduce((sum, u) => sum + u.totalChunks, 0)} total chunks
                </span>
              </p>
              <p className="text-sm font-medium text-text-primary">
                <span className="text-text-secondary">
                  {urls
                    .reduce((sum, u) => sum + u.wordCount, 0)
                    .toLocaleString()}{' '}
                  words
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebScraper;