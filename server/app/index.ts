import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "../routes";
import { NotFoundException, SuccessResponse } from "../utils/httpResponses";

const app = express();

app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        // @ts-ignore
        req.rawBody = buf.toString(encoding || "utf8");
      }
    },
  })
);
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:3001", "https://dev.ig-helper-tool.store", "https://ig-helper-tool.store"],
  })
);

app.use(cookieParser());

app.get("/api/healthcheck", (req: Request, res: Response) => new SuccessResponse(res, "OK", 200, false));

app.use("/api", routes);

app.use("*", (req, res) => new NotFoundException(res));

export default app;
