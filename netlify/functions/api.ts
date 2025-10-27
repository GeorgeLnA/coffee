import serverless from "serverless-http";
import { createServer } from "../../dist/server/index.js";

export const handler = serverless(createServer());
