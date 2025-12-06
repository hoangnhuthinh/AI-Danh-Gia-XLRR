import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { ListView } from './views/ListView';
import { AIImportView } from './views/AIImportView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { LoginView } from './views/LoginView';
import { INITIAL_REQUESTS } from './data/mockData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { testApiKey } from './utils/geminiService';

function MainApp() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // API key starts empty on every login for security
  // Only use environment variable as fallback for development
  useEffect(() => {
    if (currentUser) {
      // Only load from env variable, NOT from localStorage (for security)
      const envKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
      setApiKey(envKey);
    } else {
      setApiKey('');
    }
  }, [currentUser]);

  // Load requests for current user from Supabase
  useEffect(() => {
    if (currentUser) {
      // Load requests from localStorage only (no server storage)
      const loadRequests = () => {
        console.log('📂 Loading requests from localStorage...');
        try {
          const allRequests = JSON.parse(localStorage.getItem('all_requests') || '[]');
          // Filter by user email
          const userRequests = allRequests.filter(r => r.ownerEmail === currentUser.email);
          setRequests(userRequests);
          console.log(`✅ Loaded ${userRequests.length} requests from localStorage`);
        } catch (err) {
          console.error('❌ Error loading from localStorage:', err);
          setRequests([]);
        }
      };

      loadRequests();
    }
  }, [currentUser]);

  // API key is only stored in memory for this session, not persisted
  const handleSaveApiKey = async (key) => {
    setApiKey(key);
    setIsTestingApi(true);
    setIsApiConnected(false);

    // Test the API connection
    console.log('🔍 Testing API key...');
    const isValid = await testApiKey(key);
    setIsApiConnected(isValid);
    setIsTestingApi(false);

    if (isValid) {
      console.log('✅ API connection verified!');
    } else {
      console.warn('❌ API key invalid or connection failed');
    }
  };

  const handleCreateRequest = (aiData) => {
    console.log('💾 Saving request to localStorage...');

    // Generate local ID
    const localId = `XLN-${Date.now()}`;

    // Create request object
    const newRequest = {
      id: localId,
      title: `Tờ trình XLN: ${aiData.extractedData?.customerName || 'N/A'}`,
      type: 'recovery',
      severity: aiData.analysis?.riskLevel === 'High' ? 'high' : 'medium',
      amount: aiData.extractedData?.totalOutstanding,
      status: 'pending',
      requester: currentUser.name,
      department: currentUser.role,
      ownerEmail: currentUser.email,
      date: new Date().toISOString().split('T')[0],
      description: `Dư nợ: ${aiData.extractedData?.totalOutstanding}. TSĐB: ${aiData.extractedData?.collateralValue}.`,
      solution: `Kiến nghị: ${aiData.analysis?.recommendation?.action || 'N/A'}`,
      comments: [],
      aiAnalysis: aiData.analysis,
      extractedData: aiData.extractedData
    };

    // Update UI
    setRequests(prev => [newRequest, ...prev]);
    setCurrentView('list');

    // Save to localStorage only
    try {
      const storedRequests = JSON.parse(localStorage.getItem('all_requests') || '[]');
      localStorage.setItem('all_requests', JSON.stringify([newRequest, ...storedRequests]));
      console.log('✅ Request saved to localStorage');
    } catch (e) {
      console.error('❌ Failed to save to localStorage:', e);
    }
  };

  const handleDeleteRequest = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tờ trình này?')) {
      console.log('🗑️ Deleting request:', id);

      // Update UI
      const updatedRequests = requests.filter(r => r.id !== id);
      setRequests(updatedRequests);

      // Update localStorage
      try {
        const allRequests = JSON.parse(localStorage.getItem('all_requests') || '[]');
        const filteredLocal = allRequests.filter(r => r.id !== id);
        localStorage.setItem('all_requests', JSON.stringify(filteredLocal));
        console.log('✅ Deleted from localStorage');
      } catch (e) {
        console.warn('⚠️ localStorage delete failed:', e);
      }
    }
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setCurrentView('request_detail');
  };

  if (!currentUser) {
    return <LoginView />;
  }

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="min-h-screen bg-sky-bg text-sky-text font-sans flex overflow-hidden">
      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedRequest(null); // Clear selection when navigating
          // Close sidebar on mobile after navigation
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
        isApiConnected={isApiConnected}
        isTestingApi={isTestingApi}
        isAdmin={isAdmin}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header
          currentView={currentView}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 overflow-auto bg-sky-bg">
          <div className="p-4 md:p-8 min-h-full">
            {currentView === 'dashboard' && (
              <DashboardView
                onNavigate={setCurrentView}
                onStartAI={() => setCurrentView('ai_import')}
              />
            )}
            {currentView === 'list' && (
              <ListView
                requests={requests}
                onStartAI={() => setCurrentView('ai_import')}
                onSelect={handleSelectRequest}
                onDelete={handleDeleteRequest}
              />
            )}
            {currentView === 'ai_import' && (
              <AIImportView
                onCreateRequest={handleCreateRequest}
                apiKey={apiKey}
                onApiKeyUpdate={handleSaveApiKey}
              />
            )}
            {currentView === 'request_detail' && selectedRequest && (
              <AIImportView
                initialData={selectedRequest}
                apiKey={apiKey}
                onApiKeyUpdate={handleSaveApiKey}
              />
            )}
          </div>
        </div>

        <footer className="py-3 text-center text-sky-text-secondary text-xs font-medium border-t border-slate-200/50 bg-sky-bg shrink-0">
          © 2025 AI Wise Recovery - NPLR South PPM - thinh.hoangnhu
        </footer>
      </main>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
