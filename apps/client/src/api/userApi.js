import api from './axiosConfig';

const BASE = '/api/admin/users';

export const getUsers = (page = 0, size = 10, keyword = '', role = '') => {
    const params = { page, size };
    if (keyword) params.keyword = keyword;
    if (role) params.role = role;
    return api.get(BASE, { params }).then(r => r.data);
};

export const deleteUser = (id) =>
    api.delete(`${BASE}/${id}`).then(r => r.data);

export const updateUserPoint = (id, point) =>
    api.patch(`${BASE}/${id}/point`, { point }).then(r => r.data);

export const updateUserStatus = (id, status) =>
    api.patch(`${BASE}/${id}/status`, { status }).then(r => r.data);
