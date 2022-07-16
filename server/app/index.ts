import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import routes from "../routes";
import { NotFoundException, SuccessResponse } from "../utils/httpResponses";

const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
  })
);

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/api/healthcheck", (req: Request, res: Response) => new SuccessResponse(res));

app.use("/api", routes);

app.use("*", (req, res) => new NotFoundException(res));

export default app;
