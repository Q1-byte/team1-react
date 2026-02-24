import { useState, useEffect } from 'react';
import api from '../../../api';

function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // 삭제된 항목 제외 + 최신순 정렬
  const visibleReviews = reviews
    .filter(r => !r.isDeleted)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const avgRating = visibleReviews.length > 0
    ? (visibleReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / visibleReviews.length).toFixed(1)
    : '0.0';
  const totalViews = visibleReviews.reduce((sum, r) => sum + (r.viewCount || 0), 0);

  // 페이징 계산
  const totalPages = Math.ceil(visibleReviews.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = visibleReviews.slice(indexOfFirstItem, indexOfLastItem);

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
            {visibleReviews.length}건
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
            {currentItems.map(review => (
              <tr key={review.id}>
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
                  <button onClick={() => handleDelete(review.id)} className="btn btn-danger btn-sm">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
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
      </div>
    </div>
  );
}

export default ReviewList;
