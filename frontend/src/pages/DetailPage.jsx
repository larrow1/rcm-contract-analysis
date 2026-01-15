import ContractDetail from '../components/ContractDetail';
import AppHeader from '@/components/AppHeader';

const DetailPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-stripe-indigo/15 via-stripe-purple/10 to-transparent rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-[350px] h-[350px] bg-gradient-to-tr from-stripe-cyan/10 via-stripe-indigo/10 to-transparent rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '2s' }} />

      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl relative z-10">
        <ContractDetail />
      </main>
    </div>
  );
};

export default DetailPage;
