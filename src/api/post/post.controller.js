import Posts from "../../db/Posts";

exports.selectPosts = async ctx => {
  ctx.body = await Posts.selectPosts(ctx.request.query);
};

exports.selectMyPosts = async ctx => {
  ctx.body = await Posts.selectMyPosts(ctx.request.query);
};

exports.selectMyLikePosts = async ctx => {
  ctx.body = await Posts.selectMyLikePosts(ctx.request.query);
};

exports.insertPost = async ctx => {
  console.log(ctx.request.body);
  ctx.body = await Posts.insertPost(ctx.request.body);
};

exports.insertLike = async ctx => {
  console.log(ctx.request.body);
  ctx.body = await Posts.insertLike(ctx.request.body);
};

exports.deleteLike = async ctx => {
  console.log(ctx.request.body);
  ctx.body = await Posts.deleteLike(ctx.request.body);
};
exports.selectComments = async ctx => {
  ctx.body = await Posts.selectComments(ctx.request.query);
};

exports.insertComment = async ctx => {
  console.log(ctx.request.body);
  ctx.body = await Posts.insertComment(ctx.request.body);
};

exports.selectLikes = async ctx => {
  console.log(ctx.request.body);
  ctx.body = await Posts.selectLikes(ctx.request.body);
};
