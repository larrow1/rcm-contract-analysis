import { FileText, Upload, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EmptyState = () => {
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardContent className="flex flex-col items-center justify-center py-20 px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl">
            <FileText className="w-16 h-16 text-blue-600" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-indigo-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          No Contracts Yet
        </h3>
        <p className="text-sm text-slate-600 text-center max-w-md mb-6">
          Upload your first RCM contract above to get started with AI-powered analysis.
          Get instant insights on vendor terms, pricing, and compliance.
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Upload className="w-4 h-4" />
          <span>Click the upload area above to begin</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
