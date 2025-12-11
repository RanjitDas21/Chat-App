import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from './db/db.js';
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
});

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json())
app.use(cookieParser())
app.use(cors({ credentials: true }))

//routes import
import authRouter from "./routes/auth.route.js";

//routes declaration
app.use("/api/auth", authRouter); 



connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at port : ${PORT}`);
    })
})
.catch((err) => {
    console.log("MONGODB connection failed !!", err);
})