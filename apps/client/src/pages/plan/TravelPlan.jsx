import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';


export default function TravelPlan() {
    const [planConfig, setPlanConfig] = useState({
        region_id: null,
        parent_region_db_id: null,
        region_name: "",
        sub_region: "",
        sub_region_id: null,
        people_count: 1,
        budget_range: [0, 0],
        travel_date: null,
        end_date: null,
        keywords: [],
    });

    const handleConfigChange = (key, value) => {
        setPlanConfig((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    return (
        /* 전체를 감싸는 최상위 부모에 'travel-plan-layout' 추가 */
        <div className="travel-plan-layout">
            
            <main className="plan-main-content"> 
                <Outlet context={{ planConfig, handleConfigChange }} />
            </main>
        </div>
    );
}