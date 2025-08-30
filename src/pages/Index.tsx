
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { UnifiedAnalysisInterface } from '@/components/UnifiedAnalysisInterface';
import { AnalysisHistorySidebar } from '@/components/AnalysisHistorySidebar';
import { EnhancedAnalysisResult } from '@/components/EnhancedAnalysisResult';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { useStaleAnalysisCleanup } from '@/hooks/useStaleAnalysisCleanup';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<string[]>([]);
  const { analyses, refreshAnalyses } = useAnalysisHistory();
  
  // Clean up stale analyses on component mount
  useStaleAnalysisCleanup();

  useEffect(() => {
    if (user) {
      refreshAnalyses();
    }
  }, [user, refreshAnalyses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleAnalysisStart = (analysisId: string | string[]) => {
    const ids = Array.isArray(analysisId) ? analysisId : [analysisId];
    setSelectedAnalysisIds(ids);
    refreshAnalyses();
  };

  const selectedAnalyses = analyses.filter(analysis => 
    selectedAnalysisIds.includes(analysis.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <AnalysisHistorySidebar
          analyses={analyses}
          selectedAnalysisIds={selectedAnalysisIds}
          onAnalysisSelect={setSelectedAnalysisIds}
          onRefresh={refreshAnalyses}
        />
        
        <main className="flex-1 p-6">
          {selectedAnalyses.length > 0 ? (
            <div className="space-y-6">
              {selectedAnalyses.map((analysis) => (
                <EnhancedAnalysisResult
                  key={analysis.id}
                  analysis={analysis}
                  onRefresh={refreshAnalyses}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <UnifiedAnalysisInterface onAnalysisStart={handleAnalysisStart} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
