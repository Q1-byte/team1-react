import React from 'react';
import './BottomBanner.css'; // 전용 CSS 생성 권장

export default function BottomBanner() {
    // 이미지 파일명 배열 (1번부터 4번까지)
    const bannerImages = [
        'bottombanner1.png',
        'bottombanner2.png',
        'bottombanner3.png',
        'bottombanner4.png'
    ];
    
    const bannerData = [
        { img: 'bottombanner1.png', url: 'https://knto.or.kr/eng/index' },
        { img: 'bottombanner2.png', url: 'https://korean.visitkorea.or.kr/main/main.do' },
        { img: 'bottombanner3.png', url: 'https://know.tour.go.kr/' },
        { img: 'bottombanner4.png', url: 'https://www.koroad.or.kr/' }
    ];

    return (
        <section className="bottom-banner">
            <div className="bottom-banner-content">
                <p>준비는 끝났습니다</p>
                <h2>지금 바로 나만의 여행을 시작하세요</h2>
                <p>당신이 꿈꾸던 여정, 우리가 함께합니다.</p>
            </div>

            {/* 이미지들을 담는 컨테이너 */}
            <div className="bottom-illust-container">
                {bannerData.map((item, index) => (
                    <a 
                        key={index} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="illust-box-link"
                    >
                        <div className="illust-box">
                            <img 
                                src={`/banner/${item.img}`} 
                                alt={`bottom-illust-${index + 1}`} 
                                className="bottom-illust" 
                            />
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}