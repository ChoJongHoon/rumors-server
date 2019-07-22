import Router from "koa-router";
import mailCtrl from "./mail.controller";

const mail = new Router();

mail.post("/send/code/", mailCtrl.sendCode);

module.exports = mail;
