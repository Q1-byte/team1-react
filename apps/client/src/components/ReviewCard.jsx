import React from 'react';

export default function ReviewCard({ stars, text }) {
    const renderStars = () => {
        // 데이터가 없으면 0으로 처리
        const s = Math.floor(Number(stars) || 0); 
        
        return (
            <div className="stars">
                {/* 🚩 한 줄로 깔끔하게 정리 */}
                <span style={{ color: '#FFD700' }}>{"★".repeat(s)}</span>
                <span style={{ color: '#e0e0e0' }}>{"☆".repeat(5 - s)}</span>
            </div>
        );
    };

    return (
        <> 
            <div className="stars-display">
                {renderStars()}
            </div>
            <h3 className="review-text">{text || "제목 없음"}</h3>
        </>
    );
}