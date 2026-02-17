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

    // 2. Fetch Groups
    const groupsOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/faculty/groups',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    console.log('Fetching groups...');

    const req = http.request(groupsOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Groups Response Status:', res.statusCode);
            console.log('Groups Response Body:', data);
        });
    });
    req.on('error', (e) => console.error('Error fetching groups:', e));
    req.end();
}

test().catch(console.error);
