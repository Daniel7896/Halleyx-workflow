import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import RuleEditor from './pages/RuleEditor';
import ExecutionPage from './pages/ExecutionPage';
import ExecutionLogs from './pages/ExecutionLogs';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-800">
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-secondary to-brand-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/20">
                H
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-800">HalleyX <span className="text-slate-400 font-medium">Workflows</span></span>
            </div>
          </div>
        </nav>
        <main className="relative z-10 pb-20">
          <Routes>
            <Route path="/workflows" element={<WorkflowList />} />
            <Route path="/workflows/:id/edit" element={<WorkflowEditor />} />
            <Route path="/workflows/:id/rules" element={<RuleEditor />} />
            <Route path="/workflows/:id/execute" element={<ExecutionPage />} />
            <Route path="/executions/:id" element={<ExecutionLogs />} />
            <Route path="/" element={<Navigate to="/workflows" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
