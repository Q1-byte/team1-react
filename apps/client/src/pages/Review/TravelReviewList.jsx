import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './TravelReviewList.css';

const TravelReviewList = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reviews')
            .then(res => {
                setReviews(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("후기 목록을 불러오는 중 오류 발생:", err);
                setLoading(false);
            });
    }, []);

    const renderStars = (rating) => "★".repeat(rating || 0) + "☆".repeat(5 - (rating || 0));

    if (loading) return <div className="list-container"><p>로딩 중...</p></div>;

    return (
        <div className="list-container">
            <div className="list-header">
                <h2>🌍 여행 후기 게시판</h2>
                <button className="write-btn" onClick={() => navigate('/reviews/write')}>글쓰기</button>
            </div>

            <div className="review-list">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="review-item" onClick={() => navigate(`/reviews/${review.id}`)}>
                            <div className="review-thumbnail">
                                <img
                                    src={review.thumbnailUrl || "https://via.placeholder.com/150x100?text=No+Image"}
                                    alt="썸네일"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/150x100?text=No+Image";
                                    }}
                                />
                            </div>

                            <div className="review-info">
                                <div className="info-top">
                                    <span className="destination-tag">여행지</span>
                                    <span className="rating-display">{renderStars(review.rating)}</span>
                                </div>
                                <h3>{review.title}</h3>
                                <div className="review-meta">
                                    <span>{review.authorAccountId}</span>
                                    <span className="separator">|</span>
                                    <span>{review.createdAt ? review.createdAt.split('T')[0] : ''}</span>
                                    <span className="separator">|</span>
                                    <span>조회수 {review.viewCount?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-result">등록된 후기가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default TravelReviewList;