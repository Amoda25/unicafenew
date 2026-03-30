async function testLogin() {
    try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin01',
                password: 'admin123'
            })
        });
        const data = await response.json();
        console.log('Login attempt result:', data);
    } catch (err) {
        console.error('Login fetch failed:', err.message);
    }
}

testLogin();
