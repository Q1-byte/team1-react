import { useState } from 'react';

function SpotList() {
  // Mock 여행지 데이터
  const [spots, setSpots] = useState([
    {
      id: 1,
      name: '제주 한라산',
      region: '제주',
      category: '관광',
      address: '제주특별자치도 제주시 1100로',
      avg_price: 0,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: '부산 해운대',
      region: '부산',
      category: '관광',
      address: '부산광역시 해운대구',
      avg_price: 0,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    category: '관광',
    address: '',
    avg_price: 0
  });

  const filteredSpots = spots.filter(spot =>
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSpot = {
      id: spots.length + 1,
      ...formData,
      is_active: true,
      created_at: new Date().toISOString()
    };
    setSpots([...spots, newSpot]);
    setShowForm(false);
    setFormData({ name: '', region: '', category: '관광', address: '', avg_price: 0 });
    alert('여행지가 등록되었습니다.');
  };

  const handleDelete = (id) => {
    if (window.confirm('삭제하시겠습니까?')) {
      setSpots(spots.filter(s => s.id !== id));
      alert('삭제되었습니다.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🗺️ 여행지 관리</h1>
        <p>여행지 등록 및 관리</p>
        <div style={{ marginTop: '16px' }}>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            + 여행지 등록
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>새 여행지 등록</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <input
                type="text"
                placeholder="여행지명"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="지역 (예: 서울, 부산)"
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              >
                <option>관광</option>
                <option>맛집</option>
                <option>숙소</option>
                <option>액티비티</option>
                <option>카페</option>
              </select>
              <input
                type="number"
                placeholder="평균 비용"
                value={formData.avg_price}
                onChange={(e) => setFormData({...formData, avg_price: parseInt(e.target.value)})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <input
              type="text"
              placeholder="주소"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '16px' }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-success">등록</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn" style={{ background: '#95a5a6', color: 'white' }}>
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <input
          type="text"
          placeholder="🔍 여행지명 또는 지역으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 16px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            marginBottom: '20px'
          }}
        />

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>여행지명</th>
              <th>지역</th>
              <th>카테고리</th>
              <th>주소</th>
              <th>평균 비용</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpots.map(spot => (
              <tr key={spot.id}>
                <td>{spot.id}</td>
                <td><strong>{spot.name}</strong></td>
                <td>{spot.region}</td>
                <td><span className="badge badge-success">{spot.category}</span></td>
                <td style={{ fontSize: '12px', color: '#7f8c8d' }}>{spot.address}</td>
                <td>{spot.avg_price?.toLocaleString()}원</td>
                <td>{new Date(spot.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(spot.id)} className="btn btn-danger btn-sm">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SpotList;
