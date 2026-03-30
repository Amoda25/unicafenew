const axios = require('axios');

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            username: 'admin01',
            password: 'admin123'
        });
        console.log('Login successful:', response.data);
    } catch (err) {
        console.error('Login failed:', err.response ? err.response.data : err.message);
    }
};

testLogin();
