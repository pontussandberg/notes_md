import express, { Request, Response } from "express";
import next from "next";

const env_description = process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

(async () => {
  try {
    await app.prepare();
    const server = express();

    server.all("*", (req: Request, res: Response) => {
      console.log(req)
      console.log(res)
      return handle(req, res);
    });
    server.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(`-> Ready on localhost:${port} - ENV ${env_description}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();