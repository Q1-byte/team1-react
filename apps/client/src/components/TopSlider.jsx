// apps/client/src/components/TopSlider.jsx
import React, { useState, useEffect } from 'react';
import './TopSlider.css';

export default function TopSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = 3;

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

    const SLIDE_DURATION = 4000; 

        useEffect(() => {
            const timer = setInterval(() => {
                nextSlide(); // 위에서 만든 nextSlide 함수를 재사용
            }, SLIDE_DURATION);
            return () => clearInterval(timer);
        }, []);
    return (
        <section className="topbanner-section" style={{ position: 'relative' }}>
            <div className="slider-container">
        {[0, 1, 2].map((idx) => (
            <div
                key={`bg-${idx}`}
                className={`slide-item ${currentSlide === idx ? 'active' : ''}`}
                style={{ backgroundImage: `url('/banner/Topbannerbg${idx + 1}.png')` }}
            />
        ))}
            </div>

            {/* 2. 텍스트 이미지 슬라이더 (가로 1200px 고정 영역) */}
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

            {/* 좌우 버튼: 반투명 스타일 적용 */}
            <button 
                className="slider-btn prev" 
                onClick={prevSlide} 
                style={{ 
                    zIndex: 20, position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)', color: '#fff', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '50%' 
                }}
            >
                &#10094;
            </button>
            <button 
                className="slider-btn next" 
                onClick={nextSlide} 
                style={{ 
                    zIndex: 20, position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)', color: '#fff', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '50%' 
                }}
            >
                &#10095;
            </button>

            {/* 네비게이션 도트: 하단 정중앙 정렬 */}
            <div className="slider-dots" style={{ 
                zIndex: 20, position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', 
                display: 'flex', gap: '10px' 
            }}>
                {[0, 1, 2].map((idx) => (
                    <span 
                        key={idx} 
                        className={currentSlide === idx ? 'dot active' : 'dot'} 
                        onClick={() => setCurrentSlide(idx)}
                        style={{ 
                            width: '12px', height: '12px', borderRadius: '50%', cursor: 'pointer',
                            backgroundColor: currentSlide === idx ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                            display: 'inline-block'
                        }}
                    />
                ))}
            </div>
        </section>
    );
}