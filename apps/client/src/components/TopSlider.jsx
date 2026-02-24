import React, { useState, useEffect } from 'react';
import './TopSlider.css';

export default function TopSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = 3;

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

    useEffect(() => {
        const timer = setInterval(nextSlide, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="slider-outer-container">
            <section className="topbanner-section">
                <div className="slider-container">
                    {[0, 1, 2].map((idx) => (
                        <div
                            key={`bg-${idx}`}
                            className={`slide-item ${currentSlide === idx ? 'active' : ''}`}
                            style={{ backgroundImage: `url('/banner/Topbannerbg${idx + 1}.png')` }}
                        />
                    ))}
                </div>

                <div className="banner-content-wrapper">
                    <div className="banner-content">
                        {[0, 1, 2].map((idx) => (
                            <img
                                key={`tx-${idx}`}
                                src={`/banner/Topbannertx${idx + 1}.png`}
                                alt="banner text"
                                className={`text-slide ${currentSlide === idx ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                {/* 내비게이션 버튼 */}
                <button className="slider-btn prev" onClick={prevSlide}>&#10094;</button>
                <button className="slider-btn next" onClick={nextSlide}>&#10095;</button>

                {/* 인디케이터 도트 */}
                <div className="slider-dots">
                    {[0, 1, 2].map((idx) => (
                        <span 
                            key={idx} 
                            className={`dot ${currentSlide === idx ? 'active' : ''}`} 
                            onClick={() => setCurrentSlide(idx)} 
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}