import Router from "koa-router";
import menegementCtrl from "./menegement.controller";

const auth = new Router();

auth.get("/users", menegementCtrl.users);
auth.get("/posts", menegementCtrl.posts);

module.exports = auth;
