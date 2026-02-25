import './BottomBanner.css';

export default function BottomBanner() {
    const bannerData = [
        { img: 'bottombanner1.webp', url: 'https://knto.or.kr/eng/index' },
        { img: 'bottombanner2.webp', url: 'https://korean.visitkorea.or.kr/main/main.do' },
        { img: 'bottombanner3.webp', url: 'https://know.tour.go.kr/' },
        { img: 'bottombanner4.webp', url: 'https://www.koroad.or.kr/' }
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