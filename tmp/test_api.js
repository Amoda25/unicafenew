const testRegistration = async () => {
    const urls = [
        {
            name: 'Weak Password',
            data: { name: 'Test User', username: 'TU12345', password: 'weak', role: 'student' },
            expected: 'FAILURE'
        },
        {
            name: 'Strong Password',
            data: { name: 'Test User 2', username: 'TU12346', password: 'StrongPassword123!', role: 'student' },
            expected: 'SUCCESS'
        }
    ];

    for (const test of urls) {
        console.log(`Running test: ${test.name}`);
        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test.data)
            });
            const result = await response.json();
            if (response.ok) {
                console.log(`RESULT: SUCCESS - ${JSON.stringify(result)}`);
            } else {
                console.log(`RESULT: FAILURE - ${result.message || JSON.stringify(result)}`);
            }
        } catch (err) {
            console.log(`ERROR: ${err.message}`);
        }
        console.log('---');
    }
};

testRegistration();
