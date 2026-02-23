import { Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// 컴포넌트 임포트
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="App" style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <ScrollToTop />
      {/* 상단 영역 */}
      <Header />

      {/* 라우트에 따라 바뀌는 영역 */}
      <main style={{ flex: 1, paddingTop: '140px', backgroundColor: '#f8f9fa' }}>
        <Outlet />
      </main>

      {/* 하단 영역 */}
      <Footer />
    </div>
  );
}