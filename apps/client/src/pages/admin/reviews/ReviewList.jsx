import { useState } from 'react';

function ReviewList() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      username: 'user1',
      plan_title: '제주 2박3일',
      content: '정말 좋았어요! 다음에 또 가고 싶습니다.',
      rating: 5,
      is_public: true,
      view_count: 45,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'user1',
      plan_title: '부산 당일치기',
      content: '시간이 부족했지만 알차게 다녔습니다.',
      rating: 4,
      is_public: true,
      view_count: 23,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const handleDelete = (id) => {
    if (window.confirm('후기를 삭제하시겠습니까?')) {
      setReviews(reviews.filter(r => r.id !== id));
      alert('삭제되었습니다.');
    }
  };

  const togglePublic = (id) => {
    setReviews(reviews.map(r =>
      r.id === id ? { ...r, is_public: !r.is_public } : r
    ));
  };

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
            {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}점
          </p>
        </div>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>총 조회수</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {reviews.reduce((sum, r) => sum + r.view_count, 0)}회
          </p>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>작성자</th>
              <th>여행 계획</th>
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
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.username}</td>
                <td><strong>{review.plan_title}</strong></td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {review.content}
                </td>
                <td>
                  <span style={{ color: '#f39c12', fontWeight: 'bold' }}>
                    ⭐ {review.rating}
                  </span>
                </td>
                <td>{review.view_count}</td>
                <td>
                  <button
                    onClick={() => togglePublic(review.id)}
                    className={`btn btn-sm ${review.is_public ? 'btn-success' : ''}`}
                    style={!review.is_public ? { background: '#e74c3c', color: 'white' } : {}}
                  >
                    {review.is_public ? '공개' : '비공개'}
                  </button>
                </td>
                <td>{new Date(review.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(review.id)} className="btn btn-danger btn-sm">
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

export default ReviewList;
