const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// Support multiple origins (comma-separated)
const ALLOWED_ORIGINS = FRONTEND_URL.split(',').map(s => s.trim());

const httpServer = http.createServer((req, res) => {
    // CORS headers for HTTP requests
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Health check endpoint
    if (req.url === '/' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'studentsync-socket' }));
        return;
    }

    // Endpoint for Vercel API routes to emit events
    if (req.url === '/emit' && req.method === 'POST') {
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${process.env.SOCKET_SERVER_SECRET}`) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { room, event, data } = JSON.parse(body);
                if (room && event && data) {
                    io.to(room).emit(event, data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'room, event, and data are required' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.io authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userRole}:${socket.userId}`);

    // Join user-specific room
    const room = `${socket.userRole.toLowerCase()}:${socket.userId}`;
    socket.join(room);
    console.log(`User joined room: ${room}`);

    // Join group rooms for messaging
    socket.on('join-group', (groupId) => {
        const groupRoom = `group:${groupId}`;
        socket.join(groupRoom);
        console.log(`User joined group room: ${groupRoom}`);
    });

    socket.on('leave-group', (groupId) => {
        const groupRoom = `group:${groupId}`;
        socket.leave(groupRoom);
        console.log(`User left group room: ${groupRoom}`);
    });

    // Handle group messages
    socket.on('group-message', (data) => {
        const groupRoom = `group:${data.groupId}`;
        socket.to(groupRoom).emit('new-group-message', data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userRole}:${socket.userId}`);
    });

    // Handle mark notification as read
    socket.on('mark-notification-read', (notificationId) => {
        console.log(`Marking notification ${notificationId} as read for user ${socket.userId}`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`> Socket.io server running on port ${PORT}`);
    console.log(`> Allowing origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
