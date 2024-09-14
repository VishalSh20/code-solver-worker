import express from "express";
import cors from "cors";
import executeCode from "./controllers/execute.controller.js";
import validateTestCases from "./controllers/validateTest.controller.js";
import generateTestCases from "./controllers/generatetest.controller.js";

const app = express();

const allowedOrigins = ['http://localhost:3000', 'https://gs-code-solver.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}));

app.route('/').post(executeCode);
app.route('/test/generate').post(generateTestCases);
app.route('/test/validate').post(validateTestCases);


export {app};