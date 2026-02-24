import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import App from '../App';
import React from 'react';

// 페이지 임포트
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import OAuthCallback from '../pages/auth/OAuthCallback';
import MyPage from '../pages/mypage/MyPage';
import GachaPage from '../pages/gacha/GachaPage';

// 메인 페이지 컴포넌트
import TopSlider from '../components/TopSlider';
import NavBar from '../components/NavBar';
import MidBanner from '../components/MidBanner';
import ReviewSection from '../components/ReviewSection';
import BottomBanner from '../components/BottomBanner'; // 신규 배너 추가

// 관리자 페이지
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/users/UserList';
import SpotManagement from '../pages/admin/spots/SpotList';
import PaymentManagement from '../pages/admin/payments/PaymentList';
import EventManagement from '../pages/admin/events/EventList';
import ReviewManagement from '../pages/admin/reviews/ReviewList';
import InquiryManagement from '../pages/admin/inquiries/InquiryList';

// Plan 페이지
import PlanSearch from '../pages/plan/PlanSearch';
import PlanSetup from '../pages/plan/PlanSetup'; // 기존에 선언만 되어있던 것 활용
import PlanKeyword from '../pages/plan/PlanKeyword';
import PlanResult from '../pages/plan/PlanResult';
import PlanCheckout from '../pages/plan/PlanCheckout';
import PlanReceipt from '../pages/plan/PlanReceipt';
import TravelPlan from '../pages/plan/TravelPlan';

// Inquiry 페이지 (유저용)
import InquiryList from '../pages/Inquiry/InquiryList';
import InquiryDetail from '../pages/Inquiry/InquiryDetail';
import InquiryWrite from '../pages/Inquiry/InquiryWrite';

// Event 페이지 (유저용)
import EventPage from '../pages/Event/EventList';
import EventDetail from '../pages/Event/EventDetail';

// Review 페이지 (유저용)
import TravelReviewList from '../pages/Review/TravelReviewList';
import TravelReviewDetail from '../pages/Review/TravelReviewDetail';
import TravelReviewWrite from '../pages/Review/TravelReviewWrite';
import TravelReviewEdit from '../pages/Review/TravelReviewEdit';

// Payment 페이지
import KakaoPaySuccess from '../pages/payment/kakao/KakaoPaySuccess';
import KakaoPayFail from '../pages/payment/kakao/KakaoPayFail';
import TossSuccess from '../pages/payment/toss/TossSuccess';
import TossFail from '../pages/payment/toss/TossFail';
import VBankSuccess from '../pages/payment/vbank/VBankSuccess';
import VBankFail from '../pages/payment/vbank/VBankFail';
import PaymentCancel from '../pages/payment/PaymentCancel';

// 메인 페이지 컴포넌트 임포트
import Header from '../components/Header';
import Footer from '../components/Footer';

// Protected Route (로그인 필요)
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// Guest Route (로그인 시 접근 불가)
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

// 메인 홈 컴포넌트 (BottomBanner 포함 통합)
function HomePage() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <Header />
      </div>
      <TopSlider />
      <NavBar />
      <MidBanner />
      <ReviewSection />
      <BottomBanner /> {/* 새로 추가된 하단 배너 */}
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  // 1. 메인페이지 (독립 레이아웃)
  {
    path: '/',
    element: <HomePage />
  },
  
  // 2. 공통 레이아웃 페이지 (Gacha, Plan, Payment, 커뮤니티 등)
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'gacha', element: <GachaPage /> },
      { path: 'plan/:planId', element: <PlanResult /> },
      
      // --- Plan 관련 라우트 (중첩 구조 최적화) ---
      {
        path: 'reserve',
        element: <TravelPlan />,
        children: [
          { index: true, element: <PlanSearch /> },
          { path: 'setup', element: <PlanKeyword /> }, // PlanSetup 컴포넌트로 정상 연결
          { path: 'keyword', element: <PlanKeyword /> },
          { path: 'result', element: <PlanResult /> },
          { path: ':planId', element: <PlanResult /> },
          { path: 'check', element: <PlanCheckout /> },
          { path: 'receipt', element: <PlanReceipt /> },
        ]
      },

      // Payment 관련 라우트
      { path: 'payment/kakao/success', element: <KakaoPaySuccess /> },
      { path: 'payment/kakao/fail', element: <KakaoPayFail /> },
      { path: 'payment/toss/success', element: <TossSuccess /> },
      { path: 'payment/toss/fail', element: <TossFail /> },
      { path: 'payment/vbank/success', element: <VBankSuccess /> },
      { path: 'payment/vbank/fail', element: <VBankFail /> },
      { path: 'payment/cancel', element: <PaymentCancel /> },

      // Inquiry 관련 라우트
      { path: 'inquiry', element: <InquiryList /> },
      { path: 'inquiry/:id', element: <InquiryDetail /> },
      { path: 'inquiry/write', element: <InquiryWrite /> },

      // Event 라우트
      { path: 'events', element: <EventPage /> },
      { path: 'events/:id', element: <EventDetail /> },

      // Review 라우트
      { path: 'reviews', element: <TravelReviewList /> },
      { path: 'reviews/:id', element: <TravelReviewDetail /> },
      { path: 'reviews/write', element: <TravelReviewWrite /> },
      { path: 'reviews/edit/:id', element: <TravelReviewEdit /> }
    ]
  },

  // 3. 인증 관련 (GuestRoute/ProtectedRoute 적용)
  { path: '/login', element: <GuestRoute><Login /></GuestRoute> },
  { path: '/register', element: <GuestRoute><Register /></GuestRoute> },
  { path: '/oauth/callback', element: <OAuthCallback /> },
  { path: '/mypage', element: <ProtectedRoute><MyPage /></ProtectedRoute> },

  // 4. 관리자 페이지 (ProtectedRoute & 중첩 라우트)
  {
    path: '/admin',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'spots', element: <SpotManagement /> },
      { path: 'payments', element: <PaymentManagement /> },
      { path: 'events', element: <EventManagement /> },
      { path: 'reviews', element: <ReviewManagement /> },
      { path: 'inquiries', element: <InquiryManagement /> }
    ]
  },

  // 5. 404 Not Found
  { path: '*', element: <div>404 Not Found</div> }
]);