import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/instance';
import TestChatbot from '../../components/TestChatbot';

interface WidgetConfig {
  primaryColor: string;
  secondaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
}

const TestChatbotPage: React.FC = () => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const clientResponse = await axiosInstance.get('/client/me');
        
        if (clientResponse.data.client_id) {
          const id = clientResponse.data.client_id;
          const response = await axiosInstance.get(`/admin/clients/${id}`);
          
          if (response.data.success && response.data.client) {
            // Extract API key from /admin/clients/{id} response
            if (response.data.client.api_key) {
              setApiKey(response.data.client.api_key);
            }
            
            if (response.data.client.widget_config) {
              setConfig(response.data.client.widget_config);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching client config:', err);
        // Set default colors if fetch fails
        setConfig({
          primaryColor: 'var(--color-primary)',
          secondaryColor: 'var(--color-secondary)',
          position: 'bottom-right',
          welcomeMessage: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load configuration.</p>
        </div>
      </div>
    );
  }

  return <TestChatbot apiKey={apiKey} />;
};

export default TestChatbotPage;
