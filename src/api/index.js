import Router from "koa-router";
import auth from "./auth";
import menegement from "./menegement";
import mail from "./mail";
import post from "./post";

const api = new Router();

api.use("/auth", auth.routes());
api.use("/menegement", menegement.routes());
api.use("/mail", mail.routes());
api.use("/post", post.routes());

module.exports = api;
