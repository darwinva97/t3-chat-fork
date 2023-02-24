import ws from "ws";
import fs from "fs";
import https from "https";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter } from "./router";
import { createContext } from "./router/context";
import { IncomingMessage } from "http";
import { env } from "./env";

const isDev = env.NODE_ENV === "development";

let wss: ws.Server<ws.WebSocket>;

if (isDev) {
  wss = new ws.Server({
    port: 3001,
  });
} else {
  const server = https
    .createServer(
      {
        cert: fs.readFileSync(env.SSL_PATH_CERT),
        key: fs.readFileSync(env.SSL_PATH_PKEY),
      },
      (req, res) => {
        res.writeHead(200);
        res.end("Hello world!");
      }
    )
    .listen(443);

  wss = new ws.Server({ server });
}

const handler = applyWSSHandler({ wss, router: appRouter, createContext });

wss.on("connection", async (ws: WebSocket, message: IncomingMessage) => {
  const session = await fetch(env.NEXTAUTH_URL + "/api/session", {
    headers: {
      "Content-Type": "application/json",
      cookie: String(message.headers.cookie),
    },
  }).then((res) => res.json());

  console.log(session, "<= session")

  if (!session) {
    return ws.close();
  }

  console.log(`Got a connection ${wss.clients.size}`);

  wss.once("close", () => {
    console.log(`Closed connection ${wss.clients.size}`);
  });
});

console.log(`wss server start at ws://localhost:3001`);

process.on("SIGTERM", () => {
  console.log("Got SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
