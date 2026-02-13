import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewCard from './ReviewCard';
import './ReviewSection.css';

export default function ReviewSection() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const reviews = [
        { id: 1, stars: 5, text: "정말 계획짜기가 어려운 P들에게 딱이에요!!" },
        { id: 2, stars: 5, text: "예약 결제를 한군데서 다 할 수 있어서 너무 편해요!" },
        { id: 3, stars: 5, text: "랜덤 계획에 있는 경로도 재밌어 보여요. 다음에 또 이용할게요." },
        { id: 4, stars: 4, text: "가족 여행 때 이용했는데 부모님이 너무 좋아하셨어요!" },
        { id: 5, stars: 5, text: "디자인이 깔끔해서 보기 편하고 예약도 빠르네요." },
        { id: 6, stars: 5, text: "혼자 여행 갈 때 코스 짜기 막막했는데 큰 도움 됐습니다." },
        { id: 7, stars: 4, text: "친구가 추천해줘서 써봤는데 숙소랑 맛집 동선이 예술이네요." },
        { id: 8, stars: 5, text: "이런 서비스 기다렸어요! 결제 시스템이 정말 직관적입니다." },
        { id: 9, stars: 5, text: "랜덤여행 기능으로 생각지도 못한 명소를 발견해서 행복했어요." },
        { id: 10, stars: 4, text: "데이트 코스 고민될 때마다 들어와서 참고하고 있습니다." },
        { id: 11, stars: 5, text: "전체적으로 인터페이스가 빠릿빠릿해서 사용감이 좋네요." },
        { id: 12, stars: 5, text: "여행의 질이 달라졌습니다. 주변 지인들에게도 홍보 중이에요." },
        { id: 13, stars: 3, text: "기능이 다양해서 좋아요. 더 많은 지역이 추가되면 좋겠네요." },
        { id: 14, stars: 5, text: "리뷰 보고 믿고 예약했는데 역시 실패 없는 선택이었어요." },
        { id: 15, stars: 5, text: "복잡한 예약 과정 없이 한 번에 해결되는 게 가장 큰 장점입니다." }
    ];

    const scroll = (direction) => {
        if (scrollRef.current) {
            // 현재 뷰포트 너비의 절반만큼씩 이동 (부드러운 전환)
            const scrollAmount = scrollRef.current.clientWidth / 2; 
            const scrollTo = direction === 'left' 
                ? scrollRef.current.scrollLeft - scrollAmount 
                : scrollRef.current.scrollLeft + scrollAmount;
            
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
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

                    <div className="review-container" ref={scrollRef}>
                        {reviews.map((review) => (
                            <div 
                                key={review.id} 
                                className="review-card-wrapper" 
                                onClick={() => navigate('/reviews')}
                            >
                                <ReviewCard stars={review.stars} text={review.text} />
                            </div>
                        ))}
                    </div>
                </div>

                <button className="slide-btn right" onClick={() => scroll('right')}>&gt;</button>
            </div>
        </section>
    );
}