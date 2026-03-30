const testRegister = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test Fake Student",
                username: "FAKE12345",
                password: "password123",
                role: "student"
            })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", data);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
};

testRegister();
