import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewCard from './ReviewCard';
import ReviewSkeleton from './ReviewSkeleton'; // 아까 만든 스켈레톤 컴포넌트
import './ReviewSection.css';

// ... 상단 import 생략

export default function ReviewSection() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/reviews');
                
                const actualData = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data.content || []);
                
                // 🚩 테스트 로그 추가: 브라우저 콘솔(F12)에서 확인하세요!
                console.log("==============================");
                console.log("1. 전체 데이터 구조:", actualData);
                if (actualData.length > 0) {
                    console.log("2. 첫 번째 리뷰의 별점(rating):", actualData[0].rating);
                    console.log("3. 첫 번째 리뷰의 제목(title):", actualData[0].title);
                }
                console.log("==============================");

                setReviews(actualData);
            } catch (error) {
                console.error("데이터 로드 실패:", error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 400; // 카드 너비만큼 이동
            scrollRef.current.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    return (
        <section className="review-section">
            <div className="review-title-tag">REAL REVIEW</div>
            <h2 className="review-main-title">사용자들의 솔직한 후기</h2>

            <div className="slider-outer-container">
                <button className="slide-btn left" onClick={() => scroll('left')}>&lt;</button>
                
                <div className="slider-inner-view">
                    <div className="edge-overlay left-side"></div>
                    <div className="edge-overlay right-side"></div>

                    {/* 💡 컨테이너는 여기 하나만 있어야 합니다! */}
                                        <div className="review-container" ref={scrollRef}>
                        {loading ? (
                            [1, 2, 3, 4, 5].map((i) => <ReviewSkeleton key={i} />)
                        ) : reviews.length > 0 ? (
                            // 🚩 여기 중괄호 {} 를 빼고 바로 map을 돌려야 합니다.
                            reviews.map((review) => (
                                <div 
                                    key={review.id} 
                                    className="review-card-wrapper" 
                                    onClick={() => navigate('/reviews')}
                                >
                                    <ReviewCard 
                                        stars={review.rating} 
                                        text={review.title} 
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="no-reviews">작성된 리뷰가 없습니다.</p>
                        )}
                    </div>
                </div>

                <button className="slide-btn right" onClick={() => scroll('right')}>&gt;</button>
            </div>
        </section>
    );
}