import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/instance';
import FormPosition from '../../components/FormPosition';

interface WidgetConfig {
  primaryColor: string;
  secondaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
}

interface EmbedData {
  embed_script: string;
  instructions: string[];
  example: string;
}

const ChatbotConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [embedData, setEmbedData] = useState<EmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      // First fetch the client me endpoint to get the current client's ID
      const clientMeResponse = await axiosInstance.get('/client/me');
      
      if (clientMeResponse.data.client_id) {
        const id = clientMeResponse.data.client_id;
        setClientId(id);
        
        // Then fetch the client details with widget config and embed script
        const clientResponse = await axiosInstance.get(`/admin/clients/${id}`);
        
        if (clientResponse.data.success && clientResponse.data.client) {
          if (clientResponse.data.client.widget_config) {
            setConfig(clientResponse.data.client.widget_config);
          }
          
          // Extract embed data
          if (clientResponse.data.client.embed_script) {
            setEmbedData({
              embed_script: clientResponse.data.client.embed_script,
              instructions: clientResponse.data.client.instructions || [],
              example: clientResponse.data.client.example || '',
            });
          }
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError('Failed to load widget configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!config) return;
    setConfig({
      ...config,
      [e.target.name]: e.target.value,
    });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!config) return;
    setConfig({
      ...config,
      welcomeMessage: e.target.value,
    });
  };

  const handlePositionChange = (position: 'bottom-right' | 'bottom-left') => {
    if (!config) return;
    setConfig({
      ...config,
      position,
    });
  };

  const handleSave = async () => {
    if (!clientId || !config) return;
    
    try {
      setSaving(true);
      setSuccess(false);
      
      const response = await axiosInstance.put(`/api/admin/clients/${clientId}`, {
        widget_config: {
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          position: config.position,
          welcomeMessage: config.welcomeMessage,
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
      setError(null);
    } catch (err) {
      console.error('Error saving configuration:', err);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5 pb-20">
        <div className="text-center py-12">
          <p className="text-text-secondary">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-col gap-5 pb-20">
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load widget configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gap-5 pb-20">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-text-primary font-heading text-3xl font-bold">
          Chatbot Configuration
        </h1>
        <p className="text-text-secondary font-body text-sm mt-1">
          Customize how your chatbot widget appears on your website
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 mb-5">
          Configuration saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
          {/* Configuration Form */}
          <div className="space-y-6">
            {/* Colors Section */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
              <h2 className="text-xl font-bold text-text-primary font-heading mb-4">
                Widget Colors
              </h2>
              <div className="space-y-4">
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="color"
                        name="primaryColor"
                        value={config.primaryColor}
                        onChange={handleColorChange}
                        className="w-full h-12 rounded-lg cursor-pointer border border-[var(--color-border)]"
                      />
                    </div>
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={handleColorChange}
                      name="primaryColor"
                      className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm text-text-primary font-mono"
                      placeholder="#3B82F6"
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-2">Used for user message bubbles and buttons</p>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="color"
                        name="secondaryColor"
                        value={config.secondaryColor}
                        onChange={handleColorChange}
                        className="w-full h-12 rounded-lg cursor-pointer border border-[var(--color-border)]"
                      />
                    </div>
                    <input
                      type="text"
                      value={config.secondaryColor}
                      onChange={handleColorChange}
                      name="secondaryColor"
                      className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm text-text-primary font-mono"
                      placeholder="#1E40AF"
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-2">Used for chatbot reply boxes and accents</p>
                </div>
              </div>
            </div>

            {/* Widget Position Section */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
              <h2 className="text-xl font-bold text-text-primary font-heading mb-4">
                Widget Position
              </h2>
              <div className="flex gap-4">
                <FormPosition 
                  name="Bottom Right"
                  active={config.position === 'bottom-right'}
                  onClick={() => handlePositionChange('bottom-right')}
                />
                <FormPosition 
                  name="Bottom Left"
                  active={config.position === 'bottom-left'}
                  onClick={() => handlePositionChange('bottom-left')}
                />
              </div>
            </div>

            {/* Welcome Message Section */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
              <h2 className="text-xl font-bold text-text-primary font-heading mb-4">
                Welcome Message
              </h2>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Greeting Message
                </label>
                <textarea
                  value={config.welcomeMessage}
                  onChange={handleMessageChange}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter the welcome message visitors will see when opening the chatbot"
                  maxLength={200}
                />
                <p className="text-xs text-text-secondary mt-2">
                  {config.welcomeMessage.length}/200 characters
                </p>
              </div>
            </div>

            {/* Embed Script & Integration Section */}
            {embedData && (
              <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                <h2 className="text-xl font-bold text-text-primary font-heading mb-4">
                  Integration
                </h2>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowScriptModal(!showScriptModal)}
                    className="btn btn-primary w-full"
                    style={{ padding: '12px 24px', fontSize: 'var(--text-body-size)' }}
                  >
                    {showScriptModal ? '↑ Hide Embed Script' : '↓ Show Embed Script'}
                  </button>
                  
                  {/* Embed Script Display */}
                  {showScriptModal && (
                    <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                      {/* Embed Script */}
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary mb-2">Script Code</h3>
                        <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-xs border border-gray-700">
                          <code className="text-green-400 break-all whitespace-pre-wrap">
                            {embedData.embed_script}
                          </code>
                          <button
                            onClick={() => copyToClipboard(embedData.embed_script)}
                            className="absolute top-3 right-3 text-white bg-primary px-3 py-1 rounded text-xs font-medium transition-all hover:opacity-90"
                          >
                            {copiedScript ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs text-text-secondary mt-2">Copy this script and paste it before the closing &lt;/body&gt; tag in your website HTML</p>
                      </div>

                      {/* Example HTML */}
                      {embedData.example && (
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary mb-2">Implementation Example</h3>
                          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto border border-gray-700">
                            <code className="text-green-400 whitespace-pre-wrap break-all">
                              {embedData.example}
                            </code>
                          </div>
                          <p className="text-xs text-text-secondary mt-2">This shows the recommended placement of the script in your HTML structure</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Documentation Link */}
                  <div className="p-4 border-2 border-indigo-100 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900 mb-2">Need help integrating?</p>
                        <p className="text-xs text-gray-700 mb-3">View our step-by-step integration guide to add the widget to your website.</p>
                        <button
                          onClick={() => setShowDocModal(true)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: 'var(--text-xs-size)' }}
                        >
                          View Integration Guide →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex-1"
                style={{ padding: '12px 24px', fontSize: 'var(--text-body-size)' }}
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button
                onClick={fetchClientData}
                disabled={saving}
                className="btn btn-outline"
                style={{ padding: '12px 24px', fontSize: 'var(--text-body-size)' }}
              >
                Reset
              </button>
              <button
                onClick={() => navigate('/client/test-chatbot')}
                className="btn btn-secondary"
                style={{ padding: '12px 24px', fontSize: 'var(--text-body-size)' }}
              >
                Test Chatbot
              </button>
            </div>
          </div>
        </div>

        {/* DOCUMENTATION MODAL */}
        {showDocModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-700 px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Integration Guide</h2>
                  <p className="text-sm text-gray-300 mt-1">Step-by-step guide to add the widget to your website</p>
                </div>
                <button
                  onClick={() => setShowDocModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto flex-1 p-8 space-y-6">
                {/* Step 1 */}
                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary mb-2 text-lg">Copy the Embed Script</h3>
                      <p className="text-sm text-text-secondary mb-3">
                        From the "Show Embed Script" button, copy the provided embed script to your clipboard using the "Copy" button.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary mb-2 text-lg">Add to Your Website</h3>
                      <p className="text-sm text-text-secondary mb-3">
                        Paste the script into your website's HTML file. The best location is before the closing <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">&lt;/body&gt;</code> tag to ensure the page content loads first.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg border border-[var(--color-border)] text-xs overflow-x-auto">
                        <p className="text-text-secondary mb-2 font-semibold">Example:</p>
                        <pre className="text-text-primary font-mono text-xs"><code>{`<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your website content here -->
  
  <!-- Paste the script here, before closing body tag -->
  <script>...</script>
</body>
</html>`}</code></pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary mb-2 text-lg">Verify Installation</h3>
                      <p className="text-sm text-text-secondary mb-3">
                        After adding the script, visit your website and look for the chat widget in the corner. You should see it appear based on the position you configured (bottom-right or bottom-left).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] pt-6">
                  {/* Important Notes */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Important Notes</span>
                    </p>
                    <ul className="text-sm text-amber-800 space-y-2">
                      <li>• The script is unique to your client and contains your API key</li>
                      <li>• The widget will only appear on the domain you specified</li>
                      <li>• For HTTPS websites, use HTTPS in your domain configuration</li>
                      <li>• Clear your browser cache if you don't see the widget after adding the script</li>
                      <li>• The chat assistant will use the knowledge base from your website's content</li>
                    </ul>
                  </div>

                  {/* Support */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700 flex items-start gap-2">
                      <span>ℹ️</span>
                      <span>Need further assistance? Contact our support team for advanced configuration options and troubleshooting.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ChatbotConfiguration;
