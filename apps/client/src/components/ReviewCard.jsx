import React from 'react';

export default function ReviewCard({ stars, text }) {
    return (
        <div className="review-card">
        <div className="stars">
            {"⭐".repeat(stars)} {/* 별 개수만큼 반복 출력 */}
        </div>
        <p>{text}</p>
        </div>
    );
};