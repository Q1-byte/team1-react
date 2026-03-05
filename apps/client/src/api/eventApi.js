import api from './axiosConfig';

const BASE = '/api/events';

export const getEvents = (page = 0, size = 10, name = '', type = '') => {
    const params = { page, size, sort: 'id,desc' };
    if (name) params.name = name;
    if (type) params.type = type;
    return api.get(BASE, { params }).then(r => r.data);
};

export const getEventDetail = (id) =>
    api.get(`${BASE}/${id}`).then(r => r.data);

export const createEvent = (data) =>
    api.post(BASE, data).then(r => r.data);

export const updateEvent = (id, data) =>
    api.put(`${BASE}/${id}`, data).then(r => r.data);

export const deleteEvent = (id) =>
    api.delete(`${BASE}/${id}`).then(r => r.data);
