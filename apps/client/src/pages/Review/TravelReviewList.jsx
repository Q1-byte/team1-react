import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TravelReviewList.css';

const TravelReviewList = () => {
    const navigate = useNavigate();

    // DB 테이블 설계에 맞춘 상세 가짜 데이터
    const [reviews, setReviews] = useState([
        { 
            id: 1, 
            title: "노란 유채꽃밭에서 인생샷 건지고 왔어요! 🌼", 
            user_id: 101,
            author: "봄나들이객",
            destination: "제주도", 
            content: "제주도 유채꽃 축제 정말 대박이에요. 사진 찍을 곳도 많고 가족들이랑 좋은 추억 만들었습니다!",
            rating: 5,
            difficulty_score: 1,
            is_public: true,
            is_deleted: false,
            view_count: 1250,
            created_at: "2026-03-05",
            thumb: "/event/flower.jpg" // review_image 테이블의 첫 번째 이미지(sort_order: 0)
        },
        { 
            id: 2, 
            title: "겨울 바다 기차 여행... 생각보다 훨씬 낭만적이네요", 
            user_id: 102,
            author: "혼행족", 
            destination: "강원도", 
            content: "추운 날씨였지만 기차 안에서 보는 바다는 정말 아름다웠어요. 정동진역 근처 카페 투어도 추천합니다.",
            rating: 4,
            difficulty_score: 2,
            is_public: true,
            is_deleted: false,
            view_count: 842,
            created_at: "2026-02-10",
            thumb: "/event/winter.jpg"
        },
        { 
            id: 3, 
            title: "야시장 먹거리 털기! 스테이크가 진짜 맛있음 🍖", 
            author: "맛집탐방가", 
            destination: "서울", 
            rating: 5,
            difficulty_score: 3,
            view_count: 2105,
            created_at: "2026-05-15", 
            thumb: "/event/dokkaebi.jpg"
        },
        { 
            id: 4, 
            title: "남산타워 벚꽃, 이번 주말이 절정일 듯합니다", 
            author: "사진작가L", 
            destination: "서울", 
            rating: 4,
            difficulty_score: 4,
            view_count: 562,
            created_at: "2026-04-05", 
            thumb: "/event/sakura.jpg"
        },
        { 
            id: 5, 
            title: "영화제 현장 열기 대단하네요! 레드카펫 대기 중", 
            author: "시네마덕후", 
            destination: "부산", 
            rating: 5,
            difficulty_score: 3,
            view_count: 320,
            created_at: "2026-10-05", 
            thumb: "/event/cure.jpg"
        },
        { 
            id: 6, 
            title: "전주 한옥마을 투어! 한복 입고 인생 사진 남기기", 
            author: "전주매니아", 
            destination: "전주", 
            rating: 4,
            difficulty_score: 2,
            view_count: 1580,
            created_at: "2026-06-10", 
            thumb: "/event/han.jpg"
        }
    ]);

    const handleDelete = (id) => {
        if (window.confirm("정말로 이 후기를 삭제하시겠습니까?")) {
            // DB의 is_deleted = true (Soft Delete) 로직을 프론트에서 필터링으로 구현
            setReviews(reviews.filter(r => r.id !== id));
        }
    };

    const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

    return (
        <div className="list-container">
            <div className="list-header">
                <h2>🌍 여행 후기 게시판</h2>
                <button className="write-btn" onClick={() => navigate('/reviews/write')}>글쓰기</button>
            </div>

            <div className="review-list">
                {reviews.map(review => (
                    <div key={review.id} className="review-item" onClick={() => navigate(`/reviews/${review.id}`)}>
                        <div className="review-thumbnail">
                            <img 
                                src={review.thumb} 
                                alt="썸네일" 
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150x100?text=No+Image";
                                }}
                            />
                        </div>

                        <div className="review-info">
                            <div className="info-top">
                                <span className="destination-tag">{review.destination}</span>
                                <span className="rating-display">{renderStars(review.rating)}</span>
                            </div>
                            <h3>{review.title}</h3>
                            <div className="review-meta">
                                <span>{review.author}</span>
                                <span className="separator">|</span>
                                <span>{review.created_at}</span>
                                <span className="separator">|</span>
                                <span>조회수 {review.view_count.toLocaleString()}</span>
                                <span className="difficulty-badge">난이도: {review.difficulty_score}</span>
                            </div>
                        </div>

                        <button className="delete-btn" onClick={(e) => {
                            e.stopPropagation(); 
                            handleDelete(review.id);
                        }}>삭제</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TravelReviewList;