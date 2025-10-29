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
    "http://localhost:5173",
    "https://authentication-system-frontend-m7gmdw29y.vercel.app"]

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));


app.get('/', (req, res)=> {res.send("Hello World from server!")});
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Failed:", err));

  if(process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  }


