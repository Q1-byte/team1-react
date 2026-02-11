import { useState, useEffect } from 'react';
import api from '../../../api/axiosConfig';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category: '축제',
    startDate: '',
    endDate: ''
  });

  // 이벤트 목록 조회
  const fetchEvents = () => {
    setLoading(true);
    api.get('/api/events', { params: { size: 100 } })
      .then(res => {
        const data = res.data;
        if (data && data.content) {
          setEvents(data.content);
        } else if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
      })
      .catch(err => {
        console.error('이벤트 목록 조회 실패:', err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/api/events', formData)
      .then(() => {
        alert('이벤트가 등록되었습니다.');
        setShowForm(false);
        setFormData({ name: '', address: '', category: '축제', startDate: '', endDate: '' });
        fetchEvents();
      })
      .catch(err => {
        console.error('이벤트 등록 실패:', err);
        alert('등록에 실패했습니다.');
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('삭제하시겠습니까?')) {
      api.delete(`/api/events/${id}`)
        .then(() => {
          fetchEvents();
        })
        .catch(err => {
          console.error('이벤트 삭제 실패:', err);
          alert('삭제에 실패했습니다.');
        });
    }
  };

  // 페이징 계산
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = events.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <div className="page-header">
        <h1>🎉 이벤트 관리</h1>
        <p>축제, 이벤트 등록 및 관리 (총 {events.length}건)</p>
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
                placeholder="주소"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              >
                <option>축제</option>
                <option>먹거리</option>
                <option>시즌테마</option>
              </select>
              <div></div>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
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
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이벤트명</th>
                  <th>주소</th>
                  <th>카테고리</th>
                  <th>기간</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      등록된 이벤트가 없습니다.
                    </td>
                  </tr>
                ) : (
                  currentItems.map(event => (
                    <tr key={event.id}>
                      <td>{event.id}</td>
                      <td><strong>{event.name}</strong></td>
                      <td>{event.address}</td>
                      <td><span className="badge badge-success">{event.category}</span></td>
                      <td style={{ fontSize: '13px' }}>
                        {event.startDate} ~ {event.endDate}
                      </td>
                      <td>
                        <button onClick={() => handleDelete(event.id)} className="btn btn-danger btn-sm">
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-sm"
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`btn btn-sm ${currentPage === num ? 'btn-primary' : ''}`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-sm"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EventList;
