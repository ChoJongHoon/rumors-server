import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import api from "./api";
import { jwtMiddleware } from "./lib/token";
import serve from "koa-static";
import send from "koa-send";

const app = new Koa();
const router = new Router();

router.use("/api", api.routes()); // api 라우트를 /api 경로 하위 라우트로 설정

app
  .use(bodyParser())
  .use(serve(__dirname + "/public"))
  .use(jwtMiddleware)
  .use(router.routes())
  .use(router.allowedMethods())
  .use(async ctx => {
    await send(ctx, "index.html", { root: __dirname + "/public" });
  });

// router.get("/", async (ctx, next) => {
//   ctx.body = "Home";
// });

app.listen(4000, () => {
  console.log("rumors server is listening to port 4000");
});
