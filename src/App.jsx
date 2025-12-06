import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { ListView } from './views/ListView';
import { AIImportView } from './views/AIImportView';
import { INITIAL_REQUESTS } from './data/mockData';

export default function App() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleCreateRequest = (aiData) => {
    const newRequest = {
      id: `XLN-2024-${String(requests.length + 1).padStart(3, '0')}`,
      title: `Tờ trình XLN: ${aiData.extractedData.customerName}`,
      type: 'recovery',
      severity: aiData.analysis.riskLevel === 'High' ? 'high' : 'medium',
      amount: aiData.extractedData.totalOutstanding,
      status: 'pending',
      requester: 'Bạn (Cán bộ XLN)',
      department: 'Phòng Thu hồi nợ',
      date: new Date().toISOString().split('T')[0],
      description: `Dư nợ: ${aiData.extractedData.totalOutstanding}. TSĐB: ${aiData.extractedData.collateralValue}. KH đề xuất: ${aiData.extractedData.proposedPlan}`,
      solution: `Kiến nghị: ${aiData.analysis.recommendation.action}. ${aiData.analysis.recommendation.reason}`,
      comments: [],
      aiAnalysis: aiData.analysis
    };
    setRequests([newRequest, ...requests]);
    setCurrentView('list');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex overflow-hidden">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isOpen={isSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header
          currentView={currentView}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/50">
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
            />
          )}
          {currentView === 'ai_import' && (
            <AIImportView
              onCreateRequest={handleCreateRequest}
            />
          )}
        </div>
      </main>
    </div>
  );
}
