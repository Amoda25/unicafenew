const axios = require('axios');

const testRegister = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: "Test Fake Student",
            username: "FAKE12345",
            password: "password123",
            role: "student"
        });
        console.log("Success:", response.data);
    } catch (err) {
        console.error("Error Status:", err.response?.status);
        console.error("Error Data:", err.response?.data);
    }
};

testRegister();
