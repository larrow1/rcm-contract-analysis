import ContractDetail from '../components/ContractDetail';
import AppHeader from '@/components/AppHeader';

const DetailPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <ContractDetail />
      </main>
    </div>
  );
};

export default DetailPage;
