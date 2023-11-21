import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import businessRoutes from "./routes/businesses.js";
import reviewsRoutes from "./routes/reviews.js";
import {registerCustomer, registerBusiness} from "./controllers/auth.js";
import {createReview} from "./controllers/reviews.js";
import { verifyToken } from "./middleware/auth.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "public/assets");
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});
const upload = multer({storage});

/* ROUTES WITH FILES */
app.post("/auth/register/customer", upload.single("picture"), registerCustomer);
app.post("/auth/register/business", upload.single("picture"), registerBusiness);
app.post("/reviews",verifyToken, createReview);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/businesses", businessRoutes);
app.use("/reviews", reviewsRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6000
mongoose.connect(process.env.MONGO_URL).then(()=>{
    app.listen(PORT, ()=>console.log(`Server Port: ${PORT}`));
}).catch((error)=>{
    console.log(`${error.message}, did not connect`);
})