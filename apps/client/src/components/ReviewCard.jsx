// ReviewCard.jsx
import React from 'react';

export default function ReviewCard({ stars, text }) {
    return (
        <>
            <div className="stars">
                {"⭐".repeat(stars)}{"☆".repeat(5 - stars)}
            </div>
            <p className="review-text">{text}</p>
        </>
    );
}