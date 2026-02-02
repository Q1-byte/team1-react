import React, { useState } from 'react';

export default function Footer() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <footer className="footer">
        <div className="footer-links">
            <button onClick={() => alert('고객상담')}>고객상담</button>
            <span className="divider">|</span>
            <button onClick={() => alert('문의하기')}>문의하기</button>
            <span className="divider">|</span>
            {/* 누르면 팝업이 뜨도록 상태 변경 */}
            <button onClick={() => setIsModalOpen(true)}>개인정보보호안내</button>
        </div>
        <p className="copyright">© 2026 Team1-React. All rights reserved.</p>

        {/* 팝업창 (모달) */}
        {isModalOpen && (
            <div className="modal-overlay">
            <div className="modal-content">
                <h2>개인정보보호안내</h2>
                <p>본 서비스의 개인정보 보호 정책입니다.</p>
                
                <div className="scroll-box">
                    <div className="policy-text">
                        
                        <h3>1. 개인정보의 수집 및 이용 목적</h3>
                        <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                        <li>홈페이지 회원 가입 및 관리</li>
                        <li>서비스 제공 및 여행 일정 생성</li>
                        <li>예약 및 결제 서비스 이행</li>
                        </ul>

                        <hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #eee' }} />

                        <h3>2. 수집하는 개인정보 항목</h3>
                        <p>회사는 서비스 제공을 위해 필요한 최소한의 개인정보를 수집하고 있습니다.</p>
                        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                        <li><strong>필수항목:</strong> 성명, 이메일 주소, 연락처, 로그인 ID</li>
                        <li><strong>선택항목:</strong> 여행지 선호도, 생년월일, 성별</li>
                        <li><strong>자동수집:</strong> IP주소, 쿠키, 방문 일시</li>
                        </ul>

                        <hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #eee' }} />

                        <h3>3. 보유 및 이용 기간</h3>
                        <p>이용자의 개인정보는 원칙적으로 이용목적이 달성되면 지체 없이 파기합니다. 단, 상법 등 관계법령의 규정에 의하여 보관할 필요가 있는 경우 일정 기간 보관합니다.</p>
                        <ul style={{ paddingLeft: '20px' }}>
                        <li>계약 또는 청약철회 기록: 5년</li>
                        <li>소비자 불만 또는 분쟁처리 기록: 3년</li>
                        </ul>
                    </div>
                    </div>
                     <button className="modal-confirm-btn" onClick={() => setIsModalOpen(false)}>확인</button>
                </div>
                
            </div>
            
        )}
        </footer>
    );
}