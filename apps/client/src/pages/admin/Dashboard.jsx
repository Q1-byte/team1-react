import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../api/userApi';
import { getSpots } from '../../api/spotApi';
import { getPayments } from '../../api/paymentApi';
import { getEvents } from '../../api/eventApi';
import api from '../../api/axiosConfig';
import './Admin.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSpots: 0,
    completedPayments: 0,
    totalReviews: 0,
    waitingInquiries: 0,
    todaySales: 0,
    totalSales: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = await Promise.allSettled([
          getUsers(0, 1),
          getSpots(0, 1),
          getPayments(0, 1, 'COMPLETED'),
          api.get('/api/admin/inquiries/waiting-count').then(r => ({ waiting: r.data?.data ?? r.data })),
          api.get('/api/admin/reviews', { params: { size: 1 } }).then(r => r.data),
          api.get('/api/admin/payments/today-sales').then(r => r.data),
          api.get('/api/admin/payments/stats').then(r => r.data),
          getEvents(0, 1),
        ]);

        const [users, spots, payments, inquiryStats, reviews, todaySales, paymentStats, events] = results.map(r =>
          r.status === 'fulfilled' ? (r.value?.data ?? r.value) : null
        );

        setStats({
          totalUsers: users?.totalElements || 0,
          totalSpots: spots?.totalElements || 0,
          completedPayments: payments?.totalElements || 0,
          totalReviews: reviews?.totalElements || 0,
          waitingInquiries: inquiryStats?.waiting || 0,
          todaySales: todaySales || 0,
          totalSales: paymentStats?.totalCompletedAmount || 0,
          totalEvents: events?.totalElements || 0,
        });
      } catch (err) {
        console.error('대시보드 통계 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>📊 대시보드</h1>
        <p>관리자 페이지에 오신 것을 환영합니다</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer', borderLeft: '4px solid #005ADE' }}>
          <h3>👥 총 회원 수</h3>
          <p className="stat-number">{loading ? '-' : stats.totalUsers.toLocaleString()}</p>
          <p className="stat-detail">회원 관리 바로가기 →</p>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/spots')} style={{ cursor: 'pointer', borderLeft: '4px solid #2C5F9E' }}>
          <h3>🗺️ 여행지 수</h3>
          <p className="stat-number">{loading ? '-' : stats.totalSpots.toLocaleString()}</p>
          <p className="stat-detail">여행지 관리 바로가기 →</p>
        </div>

        <div className="stat-card sales-total" onClick={() => navigate('/admin/payments')} style={{ cursor: 'pointer' }}>
          <h3>💰 전체 누적 매출</h3>
          <p className="stat-number">{loading ? '-' : `${stats.totalSales.toLocaleString()}원`}</p>
          <p className="stat-detail">결제 내역 상세 보기 →</p>
        </div>

        <div className="stat-card sales-today">
          <h3>💸 오늘 매출액</h3>
          <p className="stat-number">{loading ? '-' : `${stats.todaySales.toLocaleString()}원`}</p>
          <p className="stat-detail">오늘 결제 완료 기준</p>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/events')} style={{ cursor: 'pointer', borderLeft: '4px solid #e74c3c' }}>
          <h3>🎉 축제/이벤트</h3>
          <p className="stat-number">{loading ? '-' : stats.totalEvents.toLocaleString()}</p>
          <p className="stat-detail">이벤트 관리 바로가기 →</p>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/reviews')} style={{ cursor: 'pointer', borderLeft: '4px solid #f39c12' }}>
          <h3>⭐ 후기 수</h3>
          <p className="stat-number">{loading ? '-' : stats.totalReviews.toLocaleString()}</p>
          <p className="stat-detail">후기 관리 바로가기 →</p>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/inquiries')} style={{ cursor: 'pointer', borderLeft: '4px solid #9b59b6' }}>
          <h3>❓ 미답변 문의</h3>
          <p
            className="stat-number"
            style={{ color: stats.waitingInquiries > 0 ? '#e74c3c' : '#1a2a3a' }}
          >
            {loading ? '-' : stats.waitingInquiries.toLocaleString()}
          </p>
          <p className="stat-detail">문의 관리 바로가기 →</p>
        </div>
      </div>

      <div className="quick-menu">
        <h3>📌 빠른 메뉴</h3>
        <div className="quick-menu-buttons">
          <button onClick={() => navigate('/admin/users')} className="btn btn-primary" style={{ minWidth: '120px' }}>회원 관리</button>
          <button onClick={() => navigate('/admin/spots')} className="btn btn-primary" style={{ minWidth: '120px', background: '#2C5F9E' }}>여행지 관리</button>
          <button onClick={() => navigate('/admin/events')} className="btn btn-primary" style={{ minWidth: '120px', background: '#e74c3c' }}>이벤트 관리</button>
          <button onClick={() => navigate('/admin/payments')} className="btn btn-primary" style={{ minWidth: '120px', background: '#6495ED' }}>결제 관리</button>
          <button onClick={() => navigate('/admin/reviews')} className="btn btn-primary" style={{ minWidth: '120px', background: '#f39c12' }}>후기 관리</button>
          <button onClick={() => navigate('/admin/inquiries')} className="btn btn-primary" style={{ minWidth: '120px', background: '#9b59b6' }}>문의 관리</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
