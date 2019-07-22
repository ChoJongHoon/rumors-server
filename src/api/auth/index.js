import Router from "koa-router";
import authCtrl from "./auth.controller";

const auth = new Router();

auth.post("/register", authCtrl.register);
auth.post("/login", authCtrl.login);
auth.get("/exists/:key(id)/:value", authCtrl.exists);
auth.post("/logout", authCtrl.logout);
auth.get("/check", authCtrl.check);
auth.get("/sendMail", authCtrl.sendMail);

module.exports = auth;
