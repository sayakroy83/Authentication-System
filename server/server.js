import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';


const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
    'http://localhost:5173',]

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));


app.get('/', (req, res)=> {res.send("hello world newyork")});
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

mongoose.connect("mongodb://localhost:27017/Authentication")
.then(()=> {
    console.log("MongoDB Connected!!!");
    app.listen(port, ()=> {console.log(`server is running on ${port}`)});
})
.catch((err)=> 
    console.log("MongoDB connection failed", err));


