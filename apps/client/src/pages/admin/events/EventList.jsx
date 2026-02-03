import { useState } from 'react';

function EventList() {
  const [events, setEvents] = useState([
    {
      id: 1,
      name: '제주 벚꽃 축제',
      region: '제주',
      type: '축제',
      start_date: '2026-04-01',
      end_date: '2026-04-15',
      is_active: true,
      is_main: true
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    type: '축제',
    start_date: '',
    end_date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      id: events.length + 1,
      ...formData,
      is_active: true,
      is_main: false
    };
    setEvents([...events, newEvent]);
    setShowForm(false);
    setFormData({ name: '', region: '', type: '축제', start_date: '', end_date: '' });
    alert('이벤트가 등록되었습니다.');
  };

  const handleDelete = (id) => {
    if (window.confirm('삭제하시겠습니까?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const toggleMain = (id) => {
    setEvents(events.map(e =>
      e.id === id ? { ...e, is_main: !e.is_main } : e
    ));
  };

  return (
    <div>
      <div className="page-header">
        <h1>🎉 이벤트 관리</h1>
        <p>축제, 이벤트 등록 및 관리</p>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ marginTop: '16px' }}>
          + 이벤트 등록
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>새 이벤트 등록</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <input
                type="text"
                placeholder="이벤트명"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="지역"
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              >
                <option>축제</option>
                <option>먹거리</option>
                <option>시즌테마</option>
              </select>
              <div></div>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-success">등록</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn" style={{ background: '#95a5a6', color: 'white' }}>
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginTop: '20px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이벤트명</th>
              <th>지역</th>
              <th>유형</th>
              <th>기간</th>
              <th>메인 노출</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td><strong>{event.name}</strong></td>
                <td>{event.region}</td>
                <td><span className="badge badge-success">{event.type}</span></td>
                <td style={{ fontSize: '13px' }}>
                  {event.start_date} ~ {event.end_date}
                </td>
                <td>
                  <button
                    onClick={() => toggleMain(event.id)}
                    className={`btn btn-sm ${event.is_main ? 'btn-danger' : ''}`}
                    style={!event.is_main ? { background: '#ecf0f1', color: '#2c3e50' } : {}}
                  >
                    {event.is_main ? '★ 메인' : '☆ 일반'}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(event.id)} className="btn btn-danger btn-sm">
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

export default EventList;
