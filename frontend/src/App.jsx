import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DetailPage from './pages/DetailPage';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contract/:contractId" element={<DetailPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
