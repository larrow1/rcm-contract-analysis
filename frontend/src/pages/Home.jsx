import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ContractList from '../components/ContractList';
import AppHeader from '@/components/AppHeader';

const Home = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = (data) => {
    console.log('Upload successful:', data);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="space-y-12">
          {/* Upload Section */}
          <section className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
                AI-Powered Analysis
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Upload Your RCM Contract
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Get instant AI-powered insights from your healthcare revenue cycle management vendor contracts
              </p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </section>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-500 font-medium">
                Your Contracts
              </span>
            </div>
          </div>

          {/* Contracts List Section */}
          <section>
            <ContractList refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">
              Powered by <span className="font-semibold text-primary">Claude AI</span>
            </p>
            <p className="text-xs text-slate-500">
              RCM Contract Analysis Tool • Secure & Confidential
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
