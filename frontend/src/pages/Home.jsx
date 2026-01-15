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
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-stripe-indigo/20 via-stripe-purple/15 to-transparent rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-stripe-cyan/15 via-stripe-indigo/10 to-transparent rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-t from-stripe-pink/10 via-stripe-purple/10 to-transparent rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '4s' }} />

      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl relative z-10">
        <div className="space-y-16">
          {/* Upload Section */}
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stripe-indigo/10 text-stripe-indigo rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-stripe-indigo rounded-full animate-pulse" />
                AI-Powered Analysis
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                Upload Your RCM Contract
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Get instant AI-powered insights from your healthcare revenue cycle management vendor contracts
              </p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </section>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500 font-medium">
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
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Powered by <span className="font-semibold text-stripe-indigo">Claude AI</span>
            </p>
            <p className="text-xs text-gray-500">
              RCM Contract Analysis Tool • Secure & Confidential
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
