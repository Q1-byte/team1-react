import api from './axiosConfig';

const BASE = '/api/admin/spots';

export const getSpots = (page = 0, size = 10, keyword = '', isActive = null) => {
    const params = { page, size, sort: 'createdAt,desc' };
    if (keyword) params.keyword = keyword;
    if (isActive !== null) params.isActive = isActive;
    return api.get(BASE, { params }).then(r => r.data);
};

export const createSpot = (data) =>
    api.post(BASE, data).then(r => r.data);

export const updateSpot = (id, data) =>
    api.put(`${BASE}/${id}`, data).then(r => r.data);

export const deleteSpot = (id) =>
    api.delete(`${BASE}/${id}`).then(r => r.data);

export const toggleSpot = (id) =>
    api.patch(`${BASE}/${id}/toggle`).then(r => r.data);
