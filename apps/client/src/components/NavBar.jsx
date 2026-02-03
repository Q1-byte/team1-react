import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
    const navigate = useNavigate();

    const menus = [
        { id: 1, title: '예약하기', img: '/banner/icon1.png', link: '/reserve' },
        { id: 2, title: '랜덤여행', img: '/banner/icon2.png', link: '/gacha' },
        { id: 3, title: '이벤트', img: '/banner/icon3.png', link: '/event' },
    ];

    const handleMenuClick = (menu) => {
        if (menu.link && menu.id === 2) {
            // 랜덤여행(가챠) 클릭 시 페이지 이동
            navigate(menu.link);
        } else {
            alert(`${menu.title} 페이지는 준비 중입니다!`);
        }
    };

    return (
        <nav className="nav-bar">
            {menus.map((menu) => (
                <div key={menu.id} className="nav-item" onClick={() => handleMenuClick(menu)} style={{ cursor: 'pointer' }}>
                    <div className="icon-circle">
                        <img src={menu.img} alt={menu.title} />
                    </div>
                    <span>{menu.title}</span>
                </div>
            ))}
        </nav>
    );
}