import { FileText, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EmptyState = () => {
  return (
    <Card className="border-gray-200 shadow-stripe bg-white rounded-xl">
      <CardContent className="flex flex-col items-center justify-center py-20 px-6">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-stripe-indigo/20 rounded-full blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-stripe-indigo/10 to-stripe-purple/10 p-6 rounded-2xl">
            <FileText className="w-14 h-14 text-stripe-indigo" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Contracts Yet
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-md mb-8 leading-relaxed">
          Upload your first RCM contract above to get started with AI-powered analysis.
          Get instant insights on vendor terms, pricing, and compliance.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Upload className="w-4 h-4" />
          <span>Click the upload area above to begin</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
