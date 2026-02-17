const http = require('http');

async function test() {
    // 1. Login
    const loginData = JSON.stringify({
        email: 'faculty@test.com',
        password: 'password123'
    });

    const loginOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    };

    console.log('Logging in...');

    const token = await new Promise((resolve, reject) => {
        const req = http.request(loginOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const body = JSON.parse(data);
                    console.log('Login successful');
                    resolve(body.token);
                } else {
                    console.error('Login failed:', res.statusCode, data);
                    reject(new Error('Login failed'));
                }
            });
        });
        req.on('error', reject);
        req.write(loginData);
        req.end();
    });

    // 2. Create Meeting
    const meetingData = JSON.stringify({
        group_id: "1", // Assuming group ID 1 exists from previous test
        meeting_datetime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        duration: "60",
        purpose: "Test Meeting",
        location: "Virtual",
        meeting_link: "https://example.com",
        agenda: "Test agenda",
        notes: "Test notes"
    });

    const meetingOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/faculty/meetings',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': meetingData.length
        }
    };

    console.log('Creating meeting...');

    const req = http.request(meetingOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Meeting Creation Status:', res.statusCode);
            console.log('Meeting Creation Body:', data);
        });
    });
    req.on('error', (e) => console.error('Error creating meeting:', e));
    req.write(meetingData);
    req.end();
}

test().catch(console.error);
