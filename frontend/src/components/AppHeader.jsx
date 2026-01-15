import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-stripe-indigo to-stripe-purple p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                RCM Contract Analysis
              </h1>
              <p className="text-sm text-gray-500">
                Powered by Claude AI
              </p>
            </div>
          </div>

          {!isHomePage && (
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-gray-200 hover:bg-gray-50 text-gray-700 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
