import React from 'react';
import { useNavigate } from 'react-router-dom';
import  './NavBar.css';

export default function NavBar() {
    const navigate = useNavigate();

    const menus = [
        { id: 1, title: '예약하기', img: '/banner/icon1.png', link: '/reserve' },
        { id: 2, title: '랜덤여행', img: '/banner/icon2.png', link: '/gacha' },
        { id: 3, title: '여행정보', img: '/banner/icon3.png', link: '/events' },
        { id: 4, title: '리뷰보기', img: '/banner/icon4.png', link: '/reviews' },
    ];

    const handleMenuClick = (menu) => {
        if (menu.link) {
            navigate(menu.link);
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