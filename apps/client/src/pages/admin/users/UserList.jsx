import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock 사용자 데이터 가져오기
  useEffect(() => {
    const loadUsers = () => {
      const usersData = localStorage.getItem('mock_users');
      if (usersData) {
        setUsers(JSON.parse(usersData));
      }
    };
    loadUsers();
  }, []);

  // 검색 필터링
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 회원 삭제
  const handleDelete = (userId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
      alert('삭제되었습니다.');
    }
  };

  // 포인트 수정
  const handleEditPoint = (userId) => {
    const user = users.find(u => u.id === userId);
    const newPoint = prompt(`${user.username}의 포인트를 수정하세요:`, user.point);

    if (newPoint !== null && !isNaN(newPoint)) {
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, point: parseInt(newPoint) } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
      alert('포인트가 수정되었습니다.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>👥 회원 관리</h1>
        <p>전체 회원 목록 및 관리</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="🔍 아이디 또는 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              maxWidth: '400px'
            }}
          />
          <div style={{ color: '#7f8c8d' }}>
            총 {filteredUsers.length}명
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>아이디</th>
              <th>이메일</th>
              <th>연락처</th>
              <th>권한</th>
              <th>포인트</th>
              <th>여행 성향</th>
              <th>가입일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  검색 결과가 없습니다
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : 'badge-success'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <strong>{user.point?.toLocaleString() || 0}P</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      {user.keyword_pref || '-'}
                    </span>
                  </td>
                  <td>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleEditPoint(user.id)}
                        className="btn btn-primary btn-sm"
                      >
                        포인트
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn btn-danger btn-sm"
                        disabled={user.role === 'ADMIN'}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserList;
