import Router from "koa-router";
import postCtrl from "./post.controller";

const post = new Router();

post.get("/select/posts", postCtrl.selectPosts);
post.get("/select/myposts", postCtrl.selectMyPosts);
post.get("/select/mylikeposts", postCtrl.selectMyLikePosts);
post.post("/insert/post", postCtrl.insertPost);
post.post("/insert/like", postCtrl.insertLike);
post.post("/delete/like", postCtrl.deleteLike);
post.get("/select/comments", postCtrl.selectComments);
post.post("/insert/comment", postCtrl.insertComment);
post.post("/select/likes", postCtrl.selectLikes);

module.exports = post;
