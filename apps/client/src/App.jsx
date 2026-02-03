import { Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// 컴포넌트 임포트
import Header from './components/Header';
import TopSlider from './components/TopSlider';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="App">
      {/* 모든 페이지에서 공통으로 보이는 상단 영역 */}
      <Header />
      <TopSlider />
      <NavBar />

      {/* 주소(Path)에 따라 바뀌는 영역 */}
      <main style={{ minHeight: '60vh' }}>
        <Outlet />
      </main>

      {/* 모든 페이지에서 공통으로 보이는 하단 영역 */}
      <Footer />
    </div>
  );
}
