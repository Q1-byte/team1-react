import './MidBanner.css';

export default function MidBanner() {
    return (
        <section className="mid-banner">
        <div className="mid-banner-content">
            <p>숙소 · 교통 · 액티비티를</p>
            <h2>플랫폼 내에서 한 번에 결제</h2>
            <p>여행의 계획을 대신해주고, 여행을 자유롭게</p>
        </div>
        {/* 여기에 오른쪽 화살표 표지판 이미지가 있다면 추가 */}
        <img src="/banner/Midbanner.jpg" alt="banner-illust" className="mid-illust" />
        </section>
    );
}
