import * as dotenv from "dotenv";
dotenv.config();
import logger from "./utils/logger";
import { checkEnvVariables } from "./utils/checkEnvVariables";

checkEnvVariables();

import express, { Request, Response } from "express";
import cors from "cors";
import routes from "./routes";
import { NotFoundException, SuccessResponse } from "./utils/httpResponses";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/healthcheck", (req: Request, res: Response) => new SuccessResponse(res));

app.use("/api", routes);

app.use("*", (req, res) => new NotFoundException(res));

const PORT = process.env.PORT || 5000;

logger.info(`Running in ${process.env.NODE_ENV} Mode`);

app.listen(PORT, () => logger.info(`Server Running on PORT : ${PORT}`));
