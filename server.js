const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let io;

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.io
    io = new Server(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? process.env.NEXT_PUBLIC_APP_URL
                : 'http://localhost:3000',
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userRole}:${socket.userId}`);
        });

        // Handle mark notification as read
        socket.on('mark-notification-read', (notificationId) => {
            console.log(`Marking notification ${notificationId} as read for user ${socket.userId}`);
        });
    });

    // Make io accessible globally
    global.io = io;

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            console.log(`> Socket.io server running`);
        });
});
