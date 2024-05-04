import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
// import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import businessRoutes from "./routes/businesses.js";
import reviewsRoutes from "./routes/reviews.js";
import adminRoutes from "./routes/admin.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors());
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
// const storage = multer.diskStorage({
//     destination: function (req, file, cb){
//         cb(null, "public/assets");
//     },
//     filename: function(req, file, cb){
//         cb(null, file.originalname);
//     }
// });
// const upload = multer({storage});

// /* ROUTES WITH FILES */
// app.post("/auth/register/customer", upload.single("picture"), registerCustomer);
// app.post("/auth/register/business", upload.single("picture"), registerBusiness);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/businesses", businessRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/admin", adminRoutes);

const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => {
    console.log(`${error.message}, did not connect`);
  });

// import { GoogleGenerativeAI } from "@google/generative-ai";

// async function run() {
//   try {
//     // Access your API key as an environment variable (see "Set up your API key" above)
//     const genAI = new GoogleGenerativeAI(process.env.API_KEY);
//     const generationConfig = {
//       stopSequences: ["red"],
//       maxOutputTokens: 2048,
//       temperature: 0,
//       topP: 0.1,
//       topK: 16,
//     };

//     // For text-only input, use the gemini-pro model
//     const model = genAI.getGenerativeModel({
//       model: "gemini-pro",
//       generationConfig,
//     });

//     const review = `Review:"The company's food offerings provide acceptable quality with consistent taste across their menu. While the ingredients used are fresh, the flavors could be more robust and varied. Overall, the food meets expectations for its price range but lacks the exceptional quality found in higher-end establishments."`;

//     const prompt = `Analyze the following review and provide a one-word judgment: 'Authentic' if it is genuine or 'Fake' if it is not.\n\n${review}\n\nIf the review is determined to be fake, then provide suggestions to make it more genuine with the heading "Suggestions".\n`;

//     const authenticExample = `Example for 'Authentic':\nAuthentic\nExplanation:\n1. [Explanation 1]\n2. [Explanation 2]\n`;
//     const fakeExample = `Example for 'Fake':\nFake\nSuggestions:\n1. [Suggestion 1]\n2. [Suggestion 2]\n3. [Suggestion 3]\n`;

//     const promptText = prompt + "\n" + authenticExample + "\n" + fakeExample;
//     console.log(promptText);

//     const result = await model.generateContent(promptText);
//     const response = result.response;
//     const content = response.text();

//     console.log(content);

//     // **Improved parsing and conditional handling**
//     const lines = content.split("\n");
//     const verdictLine = lines[0].trim(); // Get the verdict line (Authentic/Fake)
//     let explanation = null;
//     let suggestions = null;

//     for (let i = 1; i < lines.length; i++) {
//       const line = lines[i].trim();
//       if (verdictLine === "Authentic" && line.startsWith("Explanation:")) {
//         // Skip the header line 'Explanation:'
//         i++; // Move to the next line for the first suggestion

//         while (i < lines.length && lines[i].trim() !== "") {
//           explanation = explanation || []; // Initialize suggestions if needed (only for Fake)
//           explanation.push(lines[i].trim()); // Extract suggestions
//           i++; // Move to the next line for the next potential suggestion
//         }
//       } else if (verdictLine === "Fake" && line.startsWith("Suggestions:")) {
//         // Skip the header line 'Suggestions:'
//         i++; // Move to the next line for the first suggestion

//         while (i < lines.length && lines[i].trim() !== "") {
//           suggestions = suggestions || []; // Initialize suggestions if needed (only for Fake)
//           suggestions.push(lines[i].trim()); // Extract suggestions
//           i++; // Move to the next line for the next potential suggestion
//         }
//       }
//     }

//     // console.log("Verdict:", verdictLine);
//     // console.log("Explanation:", explanation); 
//     // console.log("Suggestions:", suggestions);

//     // **Return the response as an object with conditional properties**
//     return {
//       semantics: verdictLine,
//       details: {
//         explanation: explanation ? explanation : null, // Include only if Authentic
//         suggestions: suggestions ? suggestions : null, // Include only if Fake
//       },
//     };
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// run();
