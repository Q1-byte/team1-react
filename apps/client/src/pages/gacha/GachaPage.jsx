// apps/client/src/pages/GachaPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './GachaPage.css'; // 같은 폴더(pages)에 있는 대문자 CSS 파일 연결

const GachaPage = () => { 
    // 리액트 훅(useState)은 항상 컴포넌트 최상단에 위치해야 합니다.
    const [difficulty, setDifficulty] = useState(1);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState(null);

    const handleDraw = async () => {
        setIsSpinning(true);
        setResult(null);
        try {
            // Spring Boot 서버가 가동 중인지 꼭 확인하세요!
            const response = await axios.get(`http://localhost:8080/api/travel/random`, {
                params: { difficulty: difficulty }
            });
            
            // 시각적인 뽑기 효과를 위해 2초 뒤에 결과 표시
            setTimeout(() => {
                setResult(response.data);
                setIsSpinning(false);
            }, 2000); 
        } catch (error) {
            console.error("데이터 로드 실패", error);
            setIsSpinning(false);
            alert("서버 연결을 확인해주세요! (Spring Boot 8080 포트)");
        }
    };

    return (
        <div className="gacha-screen">
            {/* isSpinning 상태에 따라 shake 애니메이션 클래스가 추가됩니다. */}
            <div className={`gacha-image-container ${isSpinning ? 'shake' : ''}`}>
                <img src="../public/GachaMachine.png" alt="gachamachine" />
            </div>

            <div className="difficulty-selector">
                <p>난이도 선택</p>
                {[1, 2, 3].map(star => (
                    <label key={star} style={{ margin: '0 10px', cursor: 'pointer' }}>
                        <input 
                            type="radio" 
                            name="difficulty"
                            value={star}
                            checked={difficulty === star} 
                            onChange={() => setDifficulty(star)} 
                        />
                        {"⭐".repeat(star)}
                    </label>
                ))}
            </div>

            <button className="draw-button" onClick={handleDraw} disabled={isSpinning}>
                {isSpinning ? "뽑는 중..." : "랜덤여행 뽑기"}
            </button>

            {result && (
                <div className="result-card">
                    <h3>🎉 {result.name}</h3>
                    <p>{result.location}</p>
                </div>
            )}
        </div>
    );
};

export default GachaPage;