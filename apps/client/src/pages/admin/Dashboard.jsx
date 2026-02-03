import './Admin.css';

function AdminDashboard() {
  return (
    <div>
      <div className="page-header">
        <h1>📊 대시보드</h1>
        <p>관리자 페이지에 오신 것을 환영합니다</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>👥 총 회원 수</h3>
          <p className="stat-number">2</p>
        </div>

        <div className="stat-card green">
          <h3>🗺️ 여행지 수</h3>
          <p className="stat-number">0</p>
        </div>

        <div className="stat-card red">
          <h3>💳 결제 건수</h3>
          <p className="stat-number">0</p>
        </div>

        <div className="stat-card orange">
          <h3>⭐ 후기 수</h3>
          <p className="stat-number">0</p>
        </div>
      </div>

      <div className="quick-menu">
        <h3>📌 빠른 메뉴</h3>
        <div className="quick-menu-buttons">
          <a href="/admin/users" className="btn btn-primary">회원 관리</a>
          <a href="/admin/spots" className="btn btn-success">여행지 관리</a>
          <a href="/admin/events" className="btn btn-warning">이벤트 관리</a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
