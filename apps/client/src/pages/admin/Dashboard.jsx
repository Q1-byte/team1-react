import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../api/userApi';
import { getSpots } from '../../api/spotApi';
import { getPayments } from '../../api/paymentApi';
import { getWaitingCountApi } from '../../api/inquiryApi';
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = await Promise.allSettled([
          getUsers(0, 1),
          getSpots(0, 1),
          getPayments(0, 1, 'COMPLETED'),
          getWaitingCountApi(),
          api.get('/api/admin/reviews', { params: { size: 1 } }).then(r =>
            r.data?.data ?? r.data
          ),
        ]);

        const [users, spots, payments, waitingCount, reviews] = results.map(r =>
          r.status === 'fulfilled' ? r.value : null
        );

        setStats({
          totalUsers: users?.totalElements || 0,
          totalSpots: spots?.totalElements || 0,
          completedPayments: payments?.totalElements || 0,
          totalReviews: reviews?.totalElements || 0,
          waitingInquiries: typeof waitingCount === 'number' ? waitingCount : 0,
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

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card blue" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
          <h3>👥 총 회원 수</h3>
          <p className="stat-number">{loading ? '-' : stats.totalUsers.toLocaleString()}</p>
          <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0 0' }}>회원 관리 →</p>
        </div>

        <div className="stat-card green" onClick={() => navigate('/admin/spots')} style={{ cursor: 'pointer' }}>
          <h3>🗺️ 여행지 수</h3>
          <p className="stat-number">{loading ? '-' : stats.totalSpots.toLocaleString()}</p>
          <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0 0' }}>여행지 관리 →</p>
        </div>

        <div className="stat-card red" onClick={() => navigate('/admin/payments')} style={{ cursor: 'pointer' }}>
          <h3>💳 결제완료 건수</h3>
          <p className="stat-number">{loading ? '-' : stats.completedPayments.toLocaleString()}</p>
          <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0 0' }}>결제 관리 →</p>
        </div>

        <div className="stat-card orange" onClick={() => navigate('/admin/reviews')} style={{ cursor: 'pointer' }}>
          <h3>⭐ 후기 수</h3>
          <p className="stat-number">{loading ? '-' : stats.totalReviews.toLocaleString()}</p>
          <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0 0' }}>후기 관리 →</p>
        </div>

        <div className="stat-card yellow" onClick={() => navigate('/admin/inquiries')} style={{ cursor: 'pointer' }}>
          <h3>❓ 미답변 문의</h3>
          <p
            className="stat-number"
            style={{ color: stats.waitingInquiries > 0 ? '#e74c3c' : '#1a2a3a' }}
          >
            {loading ? '-' : stats.waitingInquiries.toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0 0' }}>문의 관리 →</p>
        </div>
      </div>

      <div className="quick-menu">
        <h3>📌 빠른 메뉴</h3>
        <div className="quick-menu-buttons">
          <button onClick={() => navigate('/admin/users')} className="btn btn-primary" style={{ minWidth: '120px' }}>회원 관리</button>
          <button onClick={() => navigate('/admin/spots')} className="btn btn-primary" style={{ minWidth: '120px', background: '#2C5F9E' }}>여행지 관리</button>
          <button onClick={() => navigate('/admin/payments')} className="btn btn-primary" style={{ minWidth: '120px', background: '#6495ED' }}>결제 관리</button>
          <button onClick={() => navigate('/admin/reviews')} className="btn btn-primary" style={{ minWidth: '120px', background: '#f39c12' }}>후기 관리</button>
          <button onClick={() => navigate('/admin/inquiries')} className="btn btn-primary" style={{ minWidth: '120px', background: '#9b59b6' }}>문의 관리</button>
          <button onClick={() => navigate('/admin/events')} className="btn btn-primary" style={{ minWidth: '120px', background: '#e74c3c' }}>이벤트 관리</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
