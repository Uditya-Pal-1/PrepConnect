// backend/src/server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose';

// Import the router files
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js'; 
import opportunityRouter from './routes/opportunities.js';
import applicationRouter from './routes/applications.js';
import messageRouter from './routes/messages.js';
import contactRouter from './routes/contact.js';

dotenv.config()
const app = express()
app.disable('x-powered-by')
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
})
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((origin) => origin.trim())
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser());

app.use('/api', (req, res, next) => {
    if (req.baseUrl + req.path === '/api/auth/logout') return next();
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'MongoDB is not connected yet. Start MongoDB and try again.' });
    }
    next();
})

// THE AUTHENTICATION ROUTES 
app.use('/api/auth', authRouter);
// THE USER PROFILE ROUTES
app.use('/api/users', userRouter);
app.use('/api/opportunities', opportunityRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/messages', messageRouter);
app.use('/api/contact', contactRouter);

app.get('/', (req, res) => {
    res.json({ name: 'SkillBridge API', status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    const status = error.status || error.statusCode || 500
    res.status(status).json({ message: status === 400 ? 'Invalid request body' : 'An unexpected server error occurred' })
})

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket)=>{
    console.log('socket connected: ',socket.id)
    socket.on('disconnect',()=>console.log('socket disconnected: ', socket.id))
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`SkillBridge API listening on http://localhost:${PORT}`))
connectDB()
