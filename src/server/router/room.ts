import { createRouter } from "./context";
import { randomUUID } from "crypto";
import {
  Message,
  messageSubSchema,
  sendMessageSchema,
} from "../../constants/schemas";
import { Events } from "../../constants/events";
import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";

export const roomRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("send-message", {
    input: sendMessageSchema,
    resolve({ ctx, input }) {
      console.log(ctx.session, "ctx.session");
      const message: Message = {
        id: randomUUID(),
        ...input,
        sentAt: new Date(),
        sender: {
          name: ctx.session?.user?.name || "unknown",
        },
      };

      ctx.ee.emit(Events.SEND_MESSAGE, message);

      return message;
    },
  })
  .subscription("onSendMessage", {
    input: messageSubSchema,
    resolve({ ctx, input }) {
      return new trpc.Subscription<Message>((emit) => {
        function onMessage(data: Message) {
          if (input.roomId === data.roomId) {
            emit.data(data);
          }
        }

        ctx.ee.on(Events.SEND_MESSAGE, onMessage);

        return () => {
          ctx.ee.off(Events.SEND_MESSAGE, onMessage);
        };
      });
    },
  });
