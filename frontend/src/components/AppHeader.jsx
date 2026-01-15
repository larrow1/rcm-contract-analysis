import { FileText, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl border-b border-blue-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
              <div className="relative bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20 group-hover:scale-105 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                RCM Contract Analysis
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </h1>
              <p className="text-sm text-blue-100 font-medium">
                Powered by Claude AI
              </p>
            </div>
          </div>

          {!isHomePage && (
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 shadow-lg transition-all"
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
