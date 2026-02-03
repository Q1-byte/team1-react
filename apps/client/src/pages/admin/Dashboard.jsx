function AdminDashboard() {
  return (
    <div>
      <div className="page-header">
        <h1>📊 대시보드</h1>
        <p>관리자 페이지에 오신 것을 환영합니다</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ margin: '0 0 8px 0', color: '#3498db' }}>👥 총 회원 수</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>2</p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 8px 0', color: '#2ecc71' }}>🗺️ 여행지 수</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>0</p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 8px 0', color: '#e74c3c' }}>💳 결제 건수</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>0</p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 8px 0', color: '#f39c12' }}>⭐ 후기 수</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>0</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>📌 빠른 메뉴</h3>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <a href="/admin/users" className="btn btn-primary">회원 관리</a>
          <a href="/admin/spots" className="btn btn-success">여행지 관리</a>
          <a href="/admin/events" className="btn" style={{ background: '#f39c12', color: 'white' }}>이벤트 관리</a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
