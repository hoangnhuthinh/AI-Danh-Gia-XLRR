import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { ListView } from './views/ListView';
import { AIImportView } from './views/AIImportView';
import { AdminView } from './views/AdminView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { LoginView } from './views/LoginView';
import { INITIAL_REQUESTS } from './data/mockData';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainApp() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

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

  // Load requests for current user on mount or user change
  useEffect(() => {
    if (currentUser) {
      const allRequests = JSON.parse(localStorage.getItem('all_requests') || '[]');
      const userRequests = allRequests.filter(r => r.ownerEmail === currentUser.email);
      setRequests(userRequests);
    }
  }, [currentUser]);

  // API key is only stored in memory for this session, not persisted
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    // NOT saving to localStorage for security
  };

  const handleCreateRequest = (aiData) => {
    const newRequest = {
      id: `XLN-2024-${String(Date.now()).slice(-6)}`, // Unique ID based on timestamp
      title: `Tờ trình XLN: ${aiData.extractedData.customerName}`,
      type: 'recovery',
      severity: aiData.analysis.riskLevel === 'High' ? 'high' : 'medium',
      amount: aiData.extractedData.totalOutstanding,
      status: 'pending',
      requester: currentUser.name,
      department: currentUser.role,
      ownerEmail: currentUser.email, // Bind to user
      date: new Date().toISOString().split('T')[0],
      description: `Dư nợ: ${aiData.extractedData.totalOutstanding}. TSĐB: ${aiData.extractedData.collateralValue}. KH đề xuất: ${aiData.extractedData.proposedPlan}`,
      solution: `Kiến nghị: ${aiData.analysis.recommendation.action}. ${aiData.analysis.recommendation.reason}`,
      comments: [],
      aiAnalysis: aiData.analysis,
      extractedData: aiData.extractedData // Save full data for re-rendering
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);

    // Persist to all_requests
    const allRequests = JSON.parse(localStorage.getItem('all_requests') || '[]');
    localStorage.setItem('all_requests', JSON.stringify([newRequest, ...allRequests]));

    setCurrentView('list');
  };

  const handleDeleteRequest = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tờ trình này?')) {
      const updatedRequests = requests.filter(r => r.id !== id);
      setRequests(updatedRequests);

      // Update global storage
      const allRequests = JSON.parse(localStorage.getItem('all_requests') || '[]');
      const remainingRequests = allRequests.filter(r => r.id !== id);
      localStorage.setItem('all_requests', JSON.stringify(remainingRequests));
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
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedRequest(null); // Clear selection when navigating
        }}
        isOpen={isSidebarOpen}
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
        apiKey={apiKey}
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
            {currentView === 'admin' && isAdmin && (
              <AdminView />
            )}
          </div>
        </div>

        <footer className="py-3 text-center text-sky-text-secondary text-xs font-medium border-t border-slate-200/50 bg-sky-bg shrink-0">
          Designed & Developed by thinh.hoangnhu
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
