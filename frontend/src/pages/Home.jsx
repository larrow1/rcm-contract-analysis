import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ContractList from '../components/ContractList';
import { FileText } from 'lucide-react';

const Home = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = (data) => {
    console.log('Upload successful:', data);
    // Trigger contract list refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RCM Contract Analysis</h1>
              <p className="text-sm text-gray-600 mt-1">Upload and analyze healthcare RCM vendor contracts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Contract</h2>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </section>

          {/* Contracts List Section */}
          <section>
            <ContractList refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by Claude AI • RCM Contract Analysis Tool
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
