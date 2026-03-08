import { useState, useEffect } from "react";
import Button from "../../components/Button";
import Card from "../../components/FormCard";
import Input from "../../components/FormInput";
import Position from "../../components/FormPosition";
import StarterSuggestions from "../../components/StarterSuggestions";
import axiosInstance from "../../utils/instance";
import publicAxios from "../../utils/publicInstance";
import { getCSSVariableValueWithDefault } from "../../utils/cssVariables";
import type { SubscriptionPlan, SubscriptionPeriod } from "../../types";
import { useNotification } from "../../components/Notification";

type PositionType = "bottom-right" | "bottom-left";
type AddClientProps = { close: () => void };
type StepType = "company-info" | "subscription" | "generate-api-key" | "scrape-domain" | "generate-embeddings" | "complete";

interface ClientResponse {
    id: number;
    company_name: string;
    website_url: string;
    api_key: string;
    widget_config: any;
    embed_script: string;
}

interface ProgressState {
    isProcessing: boolean;
    progress: number;
    status: string;
    error: string | null;
}

export default function AddClient({ close }: AddClientProps) {
    const { showNotification, NotificationComponent } = useNotification();
    const [currentStep, setCurrentStep] = useState<StepType>("company-info");
    const [position, setPosition] = useState<PositionType>("bottom-right");
    const [error, setError] = useState<string | null>(null);
    const [showDocModal, setShowDocModal] = useState(false);
    
    // Company info form
    const [form, setForm] = useState(() => ({
        companyName: "",
        website: "",
        greetoName: "Greeto Assistant",
        color: getCSSVariableValueWithDefault('--color-primary', '#635BFF'),
        secondaryColor: getCSSVariableValueWithDefault('--color-secondary', '#0A2540'),
        message: "Hi! 👋 I'm Greeto, your AI assistant. How can I help you today?",
    }));

    // Starter suggestions
    const [starterSuggestions, setStarterSuggestions] = useState<string[]>([]);

    // Subscription configuration
    const [subscription, setSubscription] = useState<{
        isTrial: boolean;
        plan: SubscriptionPlan;
        period: SubscriptionPeriod;
    } | null>(null);

    // Client data from API
    const [clientData, setClientData] = useState<ClientResponse | null>(null);
    
    // Progress states
    const [scrapingProgress, setScrapingProgress] = useState<ProgressState>({
        isProcessing: false,
        progress: 0,
        status: "idle",
        error: null,
    });

    const [embeddingsProgress, setEmbeddingsProgress] = useState<ProgressState>({
        isProcessing: false,
        progress: 0,
        status: "idle",
        error: null,
    });

    // Auto-trigger domain scraping when step changes
    useEffect(() => {
        if (currentStep === "scrape-domain" && clientData?.api_key && !scrapingProgress.isProcessing) {
            handleScrapeDomain();
        }
    }, [currentStep]);

    // NOTE: Embeddings are triggered directly from monitorScrapingProgress on completion.
    // No useEffect trigger here to avoid double-invocation race condition.

    const handleInputChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    const handleGenerateApiKey = async () => {
        if (!form.companyName.trim() || !form.website.trim()) {
            setError("Company name and website are required");
            return;
        }

        try {
            setError(null);
            setCurrentStep("generate-api-key");

            const payload: any = {
                company_name: form.companyName,
                website_url: form.website,
                widget_config: {
                    primaryColor: form.color,
                    secondaryColor: form.secondaryColor,
                    position: position,
                    welcomeMessage: form.message,
                },
                starter_suggestions: starterSuggestions.length > 0 ? starterSuggestions : null,
            };

            // Add subscription config if provided
            if (subscription) {
                payload.subscription = {
                    is_trial: subscription.isTrial,
                    plan: subscription.plan,
                    period: subscription.period,
                };
            }

            const response = await axiosInstance.post("/admin/clients", payload);

            console.log("[handleGenerateApiKey] API response:", response.data);

            if (response.data.success) {
                // embed_script is at root level, not inside client object
                const clientData = {
                    ...response.data.client,
                    embed_script: response.data.embed_script
                };
                console.log("[handleGenerateApiKey] Client data with embed_script:", clientData);
                setClientData(clientData);
                setCurrentStep("scrape-domain");
            } else {
                console.error("[handleGenerateApiKey] API returned success=false");
                setError(response.data.message || "Failed to create client");
                setCurrentStep("company-info");
            }
        } catch (err: any) {
            console.error("Error creating client:", err);
            setError(err.response?.data?.error || "Failed to create client");
            setCurrentStep("company-info");
        }
    };

    const handleScrapeDomain = async () => {
        if (!clientData?.api_key) {
            setError("API key not available");
            return;
        }

        try {
            setError(null);
            setScrapingProgress({
                isProcessing: true,
                progress: 0,
                status: "Starting domain scrape...",
                error: null,
            });

            console.log("[handleScrapeDomain] Starting scrape for website:", form.website);

            const response = await publicAxios.post(
                "/scraper/crawl-domain",
                { websiteUrl: form.website },
                { headers: { "x-api-key": clientData.api_key } }
            );

            console.log("[handleScrapeDomain] Crawl-domain response:", response.data);

            // Check if response has jobId (new API structure doesn't have success field)
            if (response.data.jobId) {
                const jobId = response.data.jobId;
                console.log("[handleScrapeDomain] Job started with ID:", jobId);
                // Don't await - let monitoring run in background
                monitorScrapingProgress(jobId, clientData.api_key);
            } else {
                console.error("[handleScrapeDomain] No jobId in response");
                setScrapingProgress((prev) => ({
                    ...prev,
                    isProcessing: false,
                    error: response.data.error || response.data.message || "Failed to start domain scrape",
                }));
            }
        } catch (err: any) {
            console.error("[handleScrapeDomain] Error:", err);
            setScrapingProgress((prev) => ({
                ...prev,
                isProcessing: false,
                error: err.response?.data?.error || err.response?.data?.message || "Failed to start domain scrape",
            }));
        }
    };

    const monitorScrapingProgress = (jobId: string, apiKey: string): void => {
        const maxAttempts = 600; // 10 minutes with 1-second intervals
        let attempts = 0;
        let isCleared = false;

        console.log(`[monitorScrapingProgress] Starting monitor for jobId: ${jobId}`);

        const pollInterval = setInterval(async () => {
            if (isCleared) {
                clearInterval(pollInterval);
                return;
            }

            try {
                attempts++;
                console.log(`[Scraping Poll] Attempt ${attempts}/${maxAttempts}, JobId: ${jobId}`);
                
                const response = await publicAxios.get(`/scraper/job/${jobId}?client_id=${clientData?.id}`, {
                    headers: { "x-api-key": apiKey },
                });

                console.log(`[Scraping Response]`, response.data);

                const { status, progress, error: jobError } = response.data;

                if (jobError) {
                    console.error("[Scraping Error] Job error returned:", jobError);
                    setScrapingProgress({
                        isProcessing: false,
                        progress: 0,
                        status: "Failed",
                        error: jobError,
                    });
                    isCleared = true;
                    clearInterval(pollInterval);
                    return;
                }

                const percentage = progress?.percentage || 0;
                const scrapedUrls = progress?.scraped || 0;
                const totalUrls = progress?.totalUrls || 0;
                const chunks = progress?.chunksCreated || 0;

                console.log(`[Scraping Progress] Status: ${status}, Percentage: ${percentage}%, Scraped: ${scrapedUrls}/${totalUrls}, Chunks: ${chunks}`);

                setScrapingProgress({
                    isProcessing: status !== "completed" && status !== "failed",
                    progress: percentage,
                    status: `Scraped ${scrapedUrls}/${totalUrls} URLs • ${chunks} chunks created`,
                    error: null,
                });

                if (status === "completed") {
                    console.log("[Scraping Complete] Job completed, moving to embeddings step");
                    isCleared = true;
                    clearInterval(pollInterval);
                    setCurrentStep("generate-embeddings");
                    handleGenerateEmbeddings(apiKey);
                } else if (status === "failed" || attempts >= maxAttempts) {
                    console.error(`[Scraping Failed] Status: ${status}, Attempts: ${attempts}`);
                    isCleared = true;
                    clearInterval(pollInterval);
                    setScrapingProgress((prev) => ({
                        ...prev,
                        isProcessing: false,
                        error: status === "failed" ? jobError || "Scraping failed" : "Scraping timeout",
                    }));
                }
            } catch (err: any) {
                console.error("[Scraping Poll Error]", err);
                setScrapingProgress((prev) => ({
                    ...prev,
                    isProcessing: false,
                    error: err.response?.data?.error || "Error monitoring progress",
                }));
                isCleared = true;
                clearInterval(pollInterval);
            }
        }, 1000);
    };

    const handleGenerateEmbeddings = async (apiKey: string) => {
        try {
            setError(null);
            setEmbeddingsProgress({
                isProcessing: true,
                progress: 0,
                status: "Starting embedding generation...",
                error: null,
            });

            console.log("[handleGenerateEmbeddings] Starting embeddings generation");

            const response = await publicAxios.post(
                "/embeddings/generate",
                {},
                { headers: { "x-api-key": apiKey } }
            );

            console.log("[handleGenerateEmbeddings] Generate response:", response.data);

            if (response.data.success && response.data.jobId) {
                // Async job started — monitor via job endpoint
                console.log("[handleGenerateEmbeddings] Job started with ID:", response.data.jobId);
                monitorEmbeddingsProgress(response.data.jobId, apiKey);
            } else if (response.data.success && response.data.pendingCount === 0) {
                // Nothing to embed — all chunks already have embeddings
                console.log("[handleGenerateEmbeddings] All chunks already embedded");
                setEmbeddingsProgress({
                    isProcessing: false,
                    progress: 100,
                    status: "All chunks already have embeddings",
                    error: null,
                });
                setCurrentStep("complete");
            } else {
                console.error("[handleGenerateEmbeddings] API returned error");
                setEmbeddingsProgress((prev) => ({
                    ...prev,
                    isProcessing: false,
                    error: response.data.error || response.data.message || "Failed to generate embeddings",
                }));
            }
        } catch (err: any) {
            console.error("[handleGenerateEmbeddings] Error:", err);
            setEmbeddingsProgress((prev) => ({
                ...prev,
                isProcessing: false,
                error: err.response?.data?.error || err.response?.data?.message || "Failed to generate embeddings",
            }));
        }
    };

    const monitorEmbeddingsProgress = (jobId: number, apiKey: string): void => {
        const maxAttempts = 360; // 6 minutes with 1-second intervals
        let attempts = 0;
        let isCleared = false;

        console.log(`[monitorEmbeddingsProgress] Starting embeddings monitor for jobId: ${jobId}`);

        const pollInterval = setInterval(async () => {
            if (isCleared) {
                clearInterval(pollInterval);
                return;
            }

            try {
                attempts++;
                console.log(`[Embeddings Poll] Attempt ${attempts}/${maxAttempts}, JobId: ${jobId}`);
                
                const response = await publicAxios.get(`/embeddings/job/${jobId}`, {
                    headers: { "x-api-key": apiKey },
                });

                console.log(`[Embeddings Response]`, response.data);

                const { status, progress, cost, error: jobError } = response.data;

                if (jobError) {
                    console.error("[Embeddings Error] Job error returned:", jobError);
                    setEmbeddingsProgress({
                        isProcessing: false,
                        progress: 0,
                        status: "Failed",
                        error: jobError,
                    });
                    isCleared = true;
                    clearInterval(pollInterval);
                    return;
                }

                const percentage = progress?.percentage || 0;
                const processed = progress?.processed || 0;
                const total = progress?.totalChunks || 0;
                const estimatedCost = cost?.estimatedCost || "0.0000";

                console.log(`[Embeddings Progress] Status: ${status}, Percentage: ${percentage}%, Processed: ${processed}/${total}, Cost: $${estimatedCost}`);

                setEmbeddingsProgress({
                    isProcessing: status !== "completed" && status !== "failed",
                    progress: percentage,
                    status: `Embedded ${processed}/${total} chunks • Cost: $${estimatedCost}`,
                    error: null,
                });

                if (status === "completed") {
                    console.log("[Embeddings Complete] All embeddings generated");
                    isCleared = true;
                    clearInterval(pollInterval);
                    setCurrentStep("complete");
                } else if (status === "failed") {
                    console.error("[Embeddings Failed] Job failed");
                    isCleared = true;
                    clearInterval(pollInterval);
                    setEmbeddingsProgress((prev) => ({
                        ...prev,
                        isProcessing: false,
                        error: jobError || "Embedding generation failed",
                    }));
                } else if (attempts >= maxAttempts) {
                    console.error("[Embeddings Timeout] Max attempts reached");
                    isCleared = true;
                    clearInterval(pollInterval);
                    setEmbeddingsProgress((prev) => ({
                        ...prev,
                        isProcessing: false,
                        error: "Embedding generation timeout",
                    }));
                }
            } catch (err: any) {
                console.error("[Embeddings Poll Error]", err);
                setEmbeddingsProgress((prev) => ({
                    ...prev,
                    isProcessing: false,
                    error: err.response?.data?.error || "Error monitoring progress",
                }));
                isCleared = true;
                clearInterval(pollInterval);
            }
        }, 1000);
    };

    const handleComplete = () => {
        close();
    };

    const isStepCompleted = (stepType: StepType): boolean => {
        const steps: StepType[] = ["company-info", "subscription", "generate-api-key", "scrape-domain", "generate-embeddings", "complete"];
        return steps.indexOf(stepType) < steps.indexOf(currentStep);
    };

    const StepIndicator = ({ stepNumber, label, isActive, isCompleted }: { stepNumber: number; label: string; isActive: boolean; isCompleted: boolean }) => (
        <div className="flex flex-col items-center gap-2">
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-[var(--color-primary)] text-white ring-2 ring-[var(--color-primary)] ring-offset-2"
                        : "bg-gray-200 text-gray-600"
                }`}
            >
                {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    stepNumber
                )}
            </div>
            <span className="text-xs font-medium text-text-secondary text-center">{label}</span>
        </div>
    );

    return (
        <div className="flex flex-col gap-5 pb-20">
            {/* STEP INDICATOR */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-text-primary font-heading text-2xl">
                            {currentStep === "company-info" && "Add New Client"}
                            {currentStep === "subscription" && "Configure Subscription"}
                            {currentStep === "generate-api-key" && "Creating Client..."}
                            {currentStep === "scrape-domain" && "Scraping Domain"}
                            {currentStep === "generate-embeddings" && "Generating Embeddings"}
                            {currentStep === "complete" && "Setup Complete!"}
                        </h1>
                        <p className="text-text-secondary font-body text-sm mt-1">
                            {currentStep === "company-info" && "Fill in your company details and widget configuration"}
                            {currentStep === "subscription" && "Choose subscription plan and billing period"}
                            {currentStep === "generate-api-key" && "Generating your API key..."}
                            {currentStep === "scrape-domain" && "Crawling your website for content"}
                            {currentStep === "generate-embeddings" && "Creating AI embeddings for your content"}
                            {currentStep === "complete" && "Your client setup is complete!"}
                        </p>
                    </div>
                </div>

                {/* Steps */}
                <div className="flex justify-between gap-1 mb-4">
                    <StepIndicator stepNumber={1} label="Company Info" isActive={currentStep === "company-info"} isCompleted={isStepCompleted("company-info")} />
                    <div className="flex-1 h-1 bg-gray-200 my-4 mx-1 rounded" style={{ opacity: isStepCompleted("subscription") ? 1 : 0.3 }} />
                    <StepIndicator stepNumber={2} label="Subscription" isActive={currentStep === "subscription"} isCompleted={isStepCompleted("subscription")} />
                    <div className="flex-1 h-1 bg-gray-200 my-4 mx-1 rounded" style={{ opacity: isStepCompleted("generate-api-key") ? 1 : 0.3 }} />
                    <StepIndicator stepNumber={3} label="API Key" isActive={currentStep === "generate-api-key"} isCompleted={isStepCompleted("generate-api-key")} />
                    <div className="flex-1 h-1 bg-gray-200 my-4 mx-1 rounded" style={{ opacity: isStepCompleted("scrape-domain") ? 1 : 0.3 }} />
                    <StepIndicator stepNumber={4} label="Scrape" isActive={currentStep === "scrape-domain"} isCompleted={isStepCompleted("scrape-domain")} />
                    <div className="flex-1 h-1 bg-gray-200 my-4 mx-1 rounded" style={{ opacity: isStepCompleted("generate-embeddings") ? 1 : 0.3 }} />
                    <StepIndicator stepNumber={5} label="Embeddings" isActive={currentStep === "generate-embeddings"} isCompleted={isStepCompleted("generate-embeddings")} />
                    <div className="flex-1 h-1 bg-gray-200 my-4 mx-1 rounded" style={{ opacity: isStepCompleted("complete") ? 1 : 0.3 }} />
                    <StepIndicator stepNumber={6} label="Complete" isActive={currentStep === "complete"} isCompleted={isStepCompleted("complete")} />
                </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* STEP 1: COMPANY INFO */}
            {currentStep === "company-info" && (
                <>
                    <Card title="Company Information">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                label="Company Name"
                                required
                                value={form.companyName}
                                onChange={(v: string) => handleInputChange("companyName", v)}
                            />
                            <Input
                                label="Website"
                                required
                                value={form.website}
                                onChange={(v: string) => handleInputChange("website", v)}
                            />
                        </div>
                    </Card>

                    <Card title="Widget Configuration">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Position
                                name="Bottom Right"
                                active={position === "bottom-right"}
                                onClick={() => setPosition("bottom-right")}
                            />
                            <Position
                                name="Bottom Left"
                                active={position === "bottom-left"}
                                onClick={() => setPosition("bottom-left")}
                            />
                        </div>

                        <Input
                            label="Greeto Name"
                            value={form.greetoName}
                            onChange={(v: string) => handleInputChange("greetoName", v)}
                        />

                        {/* Primary Color Picker */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Primary Color
                            </label>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-[var(--color-border)] overflow-visible">
                                <div className="flex-shrink-0 overflow-visible">
                                    <input
                                        type="color"
                                        value={form.color}
                                        onChange={(e) => handleInputChange("color", e.target.value)}
                                        className="w-14 h-14 cursor-pointer shadow-sm hover:shadow-md transition-shadow border-0 p-0.5 rounded-lg"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={form.color}
                                    onChange={(e) => handleInputChange("color", e.target.value)}
                                    placeholder="#635BFF"
                                    className="flex-1 border border-[var(--color-border)] rounded-md px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Secondary Color Picker */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Secondary Color
                            </label>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-[var(--color-border)] overflow-visible">
                                <div className="flex-shrink-0 overflow-visible">
                                    <input
                                        type="color"
                                        value={form.secondaryColor}
                                        onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                                        className="w-14 h-14 cursor-pointer shadow-sm hover:shadow-md transition-shadow border-0 p-0.5 rounded-lg"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={form.secondaryColor}
                                    onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                                    placeholder="#0A2540"
                                    className="flex-1 border border-[var(--color-border)] rounded-md px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Welcome Message
                            </label>
                            <textarea
                                className="w-full border border-[var(--color-border)] rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                rows={4}
                                value={form.message}
                                onChange={(e) => handleInputChange("message", e.target.value)}
                            />
                        </div>

                        <StarterSuggestions
                            value={starterSuggestions}
                            onChange={setStarterSuggestions}
                        />
                    </Card>
                </>
            )}

            {/* STEP 2: SUBSCRIPTION CONFIGURATION */}
            {currentStep === "subscription" && (
                <Card title="Subscription Configuration">
                    <div className="space-y-6">
                        {/* Trial Checkbox */}
                        <div className="flex items-center gap-3 p-4 border border-[var(--color-border)] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSubscription(subscription ? { ...subscription, isTrial: !subscription.isTrial } : { isTrial: true, plan: 'professional', period: 'monthly' })}>
                            <input
                                type="checkbox"
                                checked={subscription?.isTrial ?? false}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    if (subscription) {
                                        setSubscription({ ...subscription, isTrial: e.target.checked });
                                    } else {
                                        setSubscription({ isTrial: e.target.checked, plan: 'professional', period: 'monthly' });
                                    }
                                }}
                                className="w-5 h-5 rounded cursor-pointer"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-text-primary">Create as Trial</p>
                                <p className="text-xs text-text-secondary mt-1">Start with a 30-day free professional trial period</p>
                            </div>
                        </div>

                        {/* Plan Selection */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                                Plan
                            </label>
                            <select
                                value={subscription?.plan ?? 'professional'}
                                onChange={(e) => setSubscription(subscription ? { ...subscription, plan: e.target.value as SubscriptionPlan } : { isTrial: false, plan: e.target.value as SubscriptionPlan, period: 'monthly' })}
                                className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-text-primary font-medium bg-white"
                                disabled={subscription?.isTrial}
                            >
                                <option value="professional">Professional</option>
                                <option value="business">Business</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                            {subscription?.isTrial && (
                                <p className="text-xs text-amber-600">💡 Trial subscriptions use Professional plan only</p>
                            )}
                        </div>

                        {/* Period Selection */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                                Billing Period
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSubscription(subscription ? { ...subscription, period: 'monthly' } : { isTrial: false, plan: 'professional', period: 'monthly' })}
                                    className={`px-4 py-3 rounded-lg font-medium transition-colors border-2 ${subscription?.period === 'monthly' ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]' : 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'}`}
                                    disabled={subscription?.isTrial}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setSubscription(subscription ? { ...subscription, period: 'yearly' } : { isTrial: false, plan: 'professional', period: 'yearly' })}
                                    className={`px-4 py-3 rounded-lg font-medium transition-colors border-2 ${subscription?.period === 'yearly' ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]' : 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'}`}
                                    disabled={subscription?.isTrial}
                                >
                                    Yearly
                                </button>
                            </div>
                            {subscription?.isTrial && (
                                <p className="text-xs text-amber-600">💡 Trial subscriptions use Monthly period only</p>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                            <p className="text-sm font-semibold text-blue-900">Subscription Summary</p>
                            <p className="text-sm text-blue-800">
                                {subscription?.isTrial ? (
                                    <>🎉 <strong>30-day free trial</strong> • Professional plan • Monthly period</>
                                ) : subscription ? (
                                    <>{subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan • {subscription.period.charAt(0).toUpperCase() + subscription.period.slice(1)} billing</>
                                ) : (
                                    <>No subscription configured</>
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* STEP 3: GENERATING API KEY */}
            {currentStep === "generate-api-key" && (
                <Card title="Creating Client">
                    <div className="flex flex-col items-center gap-6 py-12">
                        <div className="animate-spin">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full" />
                        </div>
                        <p className="text-center text-text-secondary">Setting up your client and generating API key...</p>
                    </div>
                </Card>
            )}

            {/* STEP 3: SCRAPING DOMAIN */}
            {currentStep === "scrape-domain" && (
                <Card title="Domain Scraping in Progress">
                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-text-primary">Progress</span>
                                <span className="text-sm font-semibold text-[var(--color-primary)]">{scrapingProgress.progress}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] transition-all duration-300"
                                    style={{ width: `${scrapingProgress.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">{scrapingProgress.status}</p>
                        </div>

                        {/* Error Message */}
                        {scrapingProgress.error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{scrapingProgress.error}</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {scrapingProgress.isProcessing && (
                            <div className="flex items-center justify-center gap-2 text-text-secondary text-sm">
                                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                                <span>Processing...</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* STEP 4: GENERATING EMBEDDINGS */}
            {currentStep === "generate-embeddings" && (
                <Card title="Generating Embeddings">
                    <div className="space-y-4">
                        {/* Scraping Complete Indicator */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-green-700">Domain scraping completed successfully!</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-text-primary">Embedding Progress</span>
                                <span className="text-sm font-semibold text-[var(--color-primary)]">{embeddingsProgress.progress}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] transition-all duration-300"
                                    style={{ width: `${embeddingsProgress.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">{embeddingsProgress.status}</p>
                        </div>

                        {/* Error Message */}
                        {embeddingsProgress.error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{embeddingsProgress.error}</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {embeddingsProgress.isProcessing && (
                            <div className="flex items-center justify-center gap-2 text-text-secondary text-sm">
                                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                                <span>Generating embeddings...</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* STEP 5: COMPLETE */}
            {currentStep === "complete" && (
                <Card title="Setup Complete!">
                    <div className="space-y-8">
                        {/* Success Message */}
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold text-green-800 text-lg">All systems ready!</p>
                                <p className="text-sm text-green-700">Your client has been created and is ready to use.</p>
                            </div>
                        </div>

                        {/* Client Details */}
                        {clientData && (
                            <div className="space-y-8">
                                {/* Company Name Section */}
                                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Client Name</p>
                                    <p className="text-3xl font-bold text-gray-900">{clientData.company_name}</p>
                                </div>

                                {/* Embed Script Section */}
                                <div>
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Embed Script</p>
                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">Copy and paste this script into your website, right before the closing <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-800 font-semibold">&lt;/body&gt;</code> tag:</p>
                                    {clientData?.embed_script ? (
                                        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                                            {/* Header */}
                                            <div className="bg-gradient-to-r from-gray-950 to-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                                                <span className="text-xs text-gray-400 font-medium">{clientData?.company_name || 'embed'}-widget.js</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(clientData.embed_script);
                                                        showNotification('Script copied to clipboard!', 'success');
                                                    }}
                                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-white text-xs font-medium rounded transition-all duration-200 hover:opacity-90"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    Copy
                                                </button>
                                            </div>
                                            {/* Code Content - Formatted Display */}
                                            <div className="px-4 py-4 overflow-x-auto bg-gray-900 min-h-20 max-h-64 overflow-y-auto">
                                                <pre className="font-mono text-sm leading-relaxed text-gray-100 whitespace-pre-wrap">
                                                    {clientData.embed_script}
                                                </pre>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                                            No embed script available
                                        </div>
                                    )}
                                </div>

                                {/* Documentation Link */}
                                <div className="p-6 border-2 border-indigo-100 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <svg className="w-6 h-6 mt-1 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 mb-2">Need help integrating?</p>
                                            <p className="text-sm text-gray-700 mb-4">View our step-by-step integration guide to add the widget to your website.</p>
                                            <button
                                                onClick={() => setShowDocModal(true)}
                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                                className="text-sm font-semibold text-white px-5 py-2 rounded-lg transition-all duration-200 hover:opacity-90"
                                            >
                                                View Integration Guide →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 sticky bottom-0 bg-white px-6 py-4 border-t border-[var(--color-border)]">
                {currentStep === "company-info" && (
                    <>
                        <Button label={'Cancel'} onClick={close} color="secondary" variant="outline" />
                        <Button
                            onClick={() => setCurrentStep("subscription")}
                            label="Next"
                            disabled={!form.companyName.trim() || !form.website.trim()}
                        />
                    </>
                )}
                {currentStep === "subscription" && (
                    <>
                        <Button label={'Back'} onClick={() => setCurrentStep("company-info")} color="secondary" variant="outline" />
                        <Button label={'Skip'} onClick={() => setCurrentStep("generate-api-key")} color="secondary" variant="outline" />
                        <Button
                            onClick={handleGenerateApiKey}
                            label="Continue"
                        />
                    </>
                )}
                {currentStep === "scrape-domain" && !scrapingProgress.isProcessing && scrapingProgress.progress > 0 && (
                    <Button onClick={close} label="Skip & Complete" />
                )}
                {currentStep === "complete" && (
                    <Button onClick={handleComplete} label="Close" />
                )}
            </div>

            {/* DOCUMENTATION MODAL */}
            {showDocModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-700 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Integration Guide</h2>
                            <button
                                onClick={() => setShowDocModal(false)}
                                style={{ color: 'var(--color-secondary)' }}
                                className="hover:opacity-75 transition-opacity"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Step 1 */}
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                                        1
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-text-primary mb-2">Copy the Embed Script</h3>
                                        <p className="text-sm text-text-secondary mb-3">
                                            From the completion screen, copy the provided embed script to your clipboard using the "Copy" button.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-text-primary mb-2">Add to Your Website</h3>
                                        <p className="text-sm text-text-secondary mb-3">
                                            Paste the script into your website's HTML file. The best location is before the closing <code className="bg-gray-100 px-1 rounded text-xs">&lt;/body&gt;</code> tag to ensure the page content loads first.
                                        </p>
                                        <div className="bg-gray-50 p-3 rounded border border-[var(--color-border)] text-xs">
                                            <p className="text-text-secondary mb-2">Example:</p>
                                            <pre className="text-text-primary overflow-x-auto"><code>{`<!DOCTYPE html>
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
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                                        3
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-text-primary mb-2">Verify Installation</h3>
                                        <p className="text-sm text-text-secondary mb-3">
                                            After adding the script, visit your website and look for the chat widget in the corner. You should see it appear based on the position you configured (bottom-right or bottom-left).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Important Notes */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-xs font-semibold text-amber-900 mb-2">✓ Important Notes:</p>
                                <ul className="text-sm text-amber-800 space-y-1">
                                    <li>• The script is unique to your client and contains your API key</li>
                                    <li>• The widget will only appear on the domain you specified</li>
                                    <li>• For HTTPS websites, use HTTPS in your domain configuration</li>
                                    <li>• Clear your browser cache if you don't see the widget after adding the script</li>
                                    <li>• The chat assistant will use the knowledge base from your website's content</li>
                                </ul>
                            </div>

                            {/* Support */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-700">
                                    Need further assistance? Contact our support team or check the documentation for advanced configuration options.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 p-6 flex justify-end">
                            <button
                                onClick={() => setShowDocModal(false)}
                                style={{ backgroundColor: 'var(--color-secondary)' }}
                                className="px-6 py-2 text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {NotificationComponent}
        </div>
    );
}
