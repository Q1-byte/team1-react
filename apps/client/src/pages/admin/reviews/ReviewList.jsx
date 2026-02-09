import { useState, useEffect } from 'react';
import api from '../../../api';

function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    api.get('/admin/reviews', { params: { size: 100 } })
      .then(res => {
        setReviews(res.data.content || []);
      })
      .catch(err => {
        console.error('리뷰 목록 조회 실패:', err);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('후기를 삭제하시겠습니까?')) {
      api.delete(`/admin/reviews/${id}`)
        .then(() => {
          alert('삭제되었습니다.');
          fetchReviews();
        })
        .catch(err => {
          console.error('삭제 실패:', err);
          alert('삭제에 실패했습니다.');
        });
    }
  };

  const togglePublic = (id) => {
    api.patch(`/admin/reviews/${id}/visibility`)
      .then(() => {
        fetchReviews();
      })
      .catch(err => {
        console.error('공개 상태 변경 실패:', err);
        alert('공개 상태 변경에 실패했습니다.');
      });
  };

  const activeReviews = reviews.filter(r => !r.isDeleted);
  const avgRating = activeReviews.length > 0
    ? (activeReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / activeReviews.length).toFixed(1)
    : '0.0';
  const totalViews = reviews.reduce((sum, r) => sum + (r.viewCount || 0), 0);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>⭐ 후기 관리</h1>
        <p>여행 후기 조회 및 관리</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>총 후기 수</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {reviews.length}건
          </p>
        </div>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>평균 평점</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f39c12' }}>
            {avgRating}점
          </p>
        </div>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>총 조회수</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {totalViews}회
          </p>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>작성자</th>
              <th>제목</th>
              <th>후기 내용</th>
              <th>평점</th>
              <th>조회수</th>
              <th>공개 여부</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id} style={review.isDeleted ? { opacity: 0.5, textDecoration: 'line-through' } : {}}>
                <td>{review.id}</td>
                <td>{review.authorAccountId}</td>
                <td><strong>{review.title}</strong></td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {review.content}
                </td>
                <td>
                  <span style={{ color: '#f39c12', fontWeight: 'bold' }}>
                    ⭐ {review.rating}
                  </span>
                </td>
                <td>{review.viewCount}</td>
                <td>
                  <button
                    onClick={() => togglePublic(review.id)}
                    className={`btn btn-sm ${review.isPublic ? 'btn-success' : ''}`}
                    style={!review.isPublic ? { background: '#e74c3c', color: 'white' } : {}}
                    disabled={review.isDeleted}
                  >
                    {review.isPublic ? '공개' : '비공개'}
                  </button>
                </td>
                <td>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '-'}</td>
                <td>
                  {review.isDeleted ? (
                    <span style={{ color: '#999' }}>삭제됨</span>
                  ) : (
                    <button onClick={() => handleDelete(review.id)} className="btn btn-danger btn-sm">
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReviewList;
