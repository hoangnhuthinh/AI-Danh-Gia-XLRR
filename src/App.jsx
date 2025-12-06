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
import { supabase } from './lib/supabase';

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

  // Load requests for current user from Supabase
  useEffect(() => {
    if (currentUser) {
      const loadRequests = async () => {
        console.log('📂 Loading requests from Supabase...');
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error loading requests:', error.message);
          // Fallback to localStorage
          const allRequests = JSON.parse(localStorage.getItem('all_requests') || '[]');
          const userRequests = allRequests.filter(r => r.ownerEmail === currentUser.email);
          setRequests(userRequests);
        } else {
          console.log('✅ Loaded requests from Supabase:', data?.length || 0);
          // Transform Supabase data to app format
          const formattedRequests = (data || []).map(r => ({
            id: r.id,
            title: `Tờ trình XLN: ${r.extracted_data?.customerName || 'N/A'}`,
            type: 'recovery',
            severity: r.ai_analysis?.riskLevel === 'High' ? 'high' : 'medium',
            amount: r.extracted_data?.totalOutstanding,
            status: 'pending',
            requester: currentUser.name,
            department: currentUser.role,
            ownerEmail: currentUser.email,
            date: new Date(r.created_at).toISOString().split('T')[0],
            description: `Dư nợ: ${r.extracted_data?.totalOutstanding}. TSĐB: ${r.extracted_data?.collateralValue}.`,
            solution: r.ai_analysis?.recommendation?.action || '',
            comments: [],
            aiAnalysis: r.ai_analysis,
            extractedData: r.extracted_data
          }));
          setRequests(formattedRequests);
        }
      };
      loadRequests();
    }
  }, [currentUser]);

  // API key is only stored in memory for this session, not persisted
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    // NOT saving to localStorage for security
  };

  const handleCreateRequest = async (aiData) => {
    console.log('💾 Saving request to Supabase...');

    // Get current user's auth ID
    const { data: { user } } = await supabase.auth.getUser();

    // Save to Supabase
    const { data: savedRequest, error } = await supabase
      .from('requests')
      .insert([{
        user_id: user?.id,
        extracted_data: aiData.extractedData,
        ai_analysis: aiData.analysis
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving request:', error.message);
      alert('Lỗi khi lưu tờ trình: ' + error.message);
      return;
    }

    console.log('✅ Request saved to Supabase:', savedRequest.id);

    // Create local format for display
    const newRequest = {
      id: savedRequest.id,
      title: `Tờ trình XLN: ${aiData.extractedData.customerName}`,
      type: 'recovery',
      severity: aiData.analysis.riskLevel === 'High' ? 'high' : 'medium',
      amount: aiData.extractedData.totalOutstanding,
      status: 'pending',
      requester: currentUser.name,
      department: currentUser.role,
      ownerEmail: currentUser.email,
      date: new Date().toISOString().split('T')[0],
      description: `Dư nợ: ${aiData.extractedData.totalOutstanding}. TSĐB: ${aiData.extractedData.collateralValue}. KH đề xuất: ${aiData.extractedData.proposedPlan}`,
      solution: `Kiến nghị: ${aiData.analysis.recommendation.action}. ${aiData.analysis.recommendation.reason}`,
      comments: [],
      aiAnalysis: aiData.analysis,
      extractedData: aiData.extractedData
    };

    setRequests([newRequest, ...requests]);
    setCurrentView('list');
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tờ trình này?')) {
      console.log('🗑️ Deleting request from Supabase:', id);

      // Delete from Supabase
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting request:', error.message);
        alert('Lỗi khi xóa tờ trình: ' + error.message);
        return;
      }

      console.log('✅ Request deleted from Supabase');
      const updatedRequests = requests.filter(r => r.id !== id);
      setRequests(updatedRequests);
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
