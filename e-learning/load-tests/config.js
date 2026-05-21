module.exports = {
  baseUrl: 'http://localhost:3000/api/v1',

  phases: [
    { duration: 20, targetUsers: 5, name: 'Ramp-up to 5 users' },
    { duration: 20, targetUsers: 20, name: 'Ramp-up to 20 users' },
    { duration: 20, targetUsers: 50, name: 'Ramp-up to 50 users' },
    { duration: 60, targetUsers: 50, name: 'Sustain 50 users' },
    { duration: 20, targetUsers: 0, name: 'Ramp-down to 0' },
  ],

  endpoints: {
    unauthenticated: [
      { method: 'POST', path: '/auth/login', body: { email: '__EMAIL__', password: 'LoadTest123!' } },
      { method: 'POST', path: '/auth/forgot-password', body: { email: '__EMAIL__' } },
      { method: 'GET', path: '/courses', query: { page: 1, limit: 12 } },
      { method: 'GET', path: '/domains' },
    ],
    authenticated: [
      { method: 'GET', path: '/auth/profile' },
      { method: 'GET', path: '/users', query: { page: 1, limit: 10 } },
      { method: 'GET', path: '/domains' },
      { method: 'GET', path: '/courses', query: { page: 1, limit: 10 } },
      { method: 'GET', path: '/enrollments' },
      { method: 'GET', path: '/payments/mine' },
      { method: 'GET', path: '/b2b/organizations' },
      { method: 'GET', path: '/instructor/profile' },
      { method: 'GET', path: '/roles/me' },
    ],
  },

  headers: {
    'Content-Type': 'application/json',
  },

  registerUser: {
    email: 'loadtest__ID__@test.com',
    password: 'LoadTest123!',
    nom: 'Load',
    prenom: 'Test__ID__',
  },
};
