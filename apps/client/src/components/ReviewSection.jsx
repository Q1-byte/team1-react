// apps/client/src/components/ReviewSection.jsx
import React from 'react';
import ReviewCard from './ReviewCard';

export default function ReviewSection() {
    const reviews = [
        { id: 1, stars: 5, text: "정말 계획짜기가 어려운 P들에게 딱이에요!!" },
        { id: 2, stars: 5, text: "예약 결제를 한군데서 다 할 수 있어서 너무 편해요!" },
        { id: 3, stars: 5, text: "랜덤 계획에 있는 경로도 재밌어 보여요. 다음에 또 이용할게요." },
    ];

    return (
        <section className="review-section">
            {/* 👈 새로운 타이틀 라벨 추가 */}
            <div className="review-title-tag">
                REAL REVIEW
            </div>
            <h2 className="review-main-title">사용자들의 솔직한 후기</h2>

            <div className="review-container">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} stars={review.stars} text={review.text} />
                ))}
            </div>
        </section>
    );
};
