import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import App from '../App';

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

// 관리자 페이지
import AdminLayout from '../pages/admin/AdminLayout';

// Plan 페이지
import PlanSearch from '../pages/plan/PlanSearch';
import PlanKeyword from '../pages/plan/PlanKeyword';
import PlanResult from '../pages/plan/PlanResult';
import PlanCheckout from '../pages/plan/PlanCheckout';
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

// Payment 페이지
import KakaoPaySuccess from '../pages/payment/kakao/KakaoPaySuccess';
import KakaoPayFail from '../pages/payment/kakao/KakaoPayFail';
import TossSuccess from '../pages/payment/toss/TossSuccess';
import TossFail from '../pages/payment/toss/TossFail';
import VBankSuccess from '../pages/payment/vbank/VBankSuccess';
import VBankFail from '../pages/payment/vbank/VBankFail';
import PaymentCancel from '../pages/payment/PaymentCancel';
import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/users/UserList';
import SpotManagement from '../pages/admin/spots/SpotList';
import PaymentManagement from '../pages/admin/payments/PaymentList';
import EventManagement from '../pages/admin/events/EventList';
import ReviewManagement from '../pages/admin/reviews/ReviewList';
import InquiryManagement from '../pages/admin/inquiries/InquiryList';

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

// 메인 홈 컴포넌트
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
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  // 메인페이지
  {
    path: '/',
    element: <HomePage />
  },
  // 공통 레이아웃 페이지
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'gacha',
        element: <GachaPage />
      },
      // --- Plan 관련 라우트 (중첩 구조 유지) ---
      {
        path: 'reserve',
        element: <TravelPlan />,
        children: [
          {
            index: true,
            element: <PlanSearch />
          },
          {
            path: 'setup',
            element: <PlanKeyword />
          },
          {
            path: 'result',
            element: <PlanResult />
          },
          {
            path: 'keyword',
            element: <PlanKeyword />
          },
          // 💡 여기에 배치하여 /reserve/check 주소를 활성화합니다.
          {
            path: 'check', 
            element: <PlanCheckout />
          }
        ]
      },
      // 💡 외부 중복 주소는 제거되었습니다.

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
      { path: 'event', element: <EventPage /> },
      { path: 'events/:id', element: <EventDetail /> },

      // Review 라우트
      { path: 'review', element: <TravelReviewList /> },
      { path: 'reviews/:id', element: <TravelReviewDetail /> },
      { path: 'reviews/write', element: <TravelReviewWrite /> }
    ]
  },
  // 인증 관련
  { path: '/login', element: <GuestRoute><Login /></GuestRoute> },
  { path: '/register', element: <GuestRoute><Register /></GuestRoute> },
  { path: '/oauth/callback', element: <OAuthCallback /> },
  { path: '/mypage', element: <ProtectedRoute><MyPage /></ProtectedRoute> },

  // 관리자 페이지
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
  // 404
  { path: '*', element: <div>404 Not Found</div> }
]);