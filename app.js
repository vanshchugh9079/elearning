import express from "express"
import cors from "cors"
import userRoute from "./routes/userRoute.js"
import courseRoute from "./routes/courseRoute.js"
const app=express();
app.use(express.json());
app.use(cors({
    origin:"*",
    methods:["GET","POST","PUT","DELETE"]
}))
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}));
app.use("/api/user",userRoute);
app.use("/api/course",courseRoute);
export default app;
