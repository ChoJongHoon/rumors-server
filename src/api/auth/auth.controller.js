import Joi from "joi";
import Users from "../../db/Users";

// 회원가입
exports.register = async ctx => {
  // 데이터 검증
  const schema = Joi.object().keys({
    userId: Joi.string()
      .email()
      .required(),
    userName: Joi.string()
      .required()
      .max(10),
    userPw: Joi.string()
      .min(4)
      .required()
  });

  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
    ctx.status = 400;
    return;
  }

  // 아이디 / 이메일 중복 체크
  let existing = null;
  try {
    existing = await Users.selectUserById(ctx.request.body.userId);
  } catch (e) {
    ctx.throw(500, e);
  }

  if (existing) {
    // 중복되는 아이디/이메일이 있을 경우
    ctx.status = 409; // Conflict
    // 어떤 값이 중복되었는지 알려줍니다
    ctx.body = {
      key: "id"
    };
    return;
  }

  let account = null;
  try {
    account = await Users.register(ctx.request.body);
  } catch (e) {
    ctx.throw(500, e);
  }

  let token = null;
  try {
    token = await Users.generateToken(ctx.request.body.userId);
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.cookies.set("access_token", token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
  ctx.body = account;
};

exports.login = async ctx => {
  // 데이터 검증
  const schema = Joi.object().keys({
    userId: Joi.string()
      .email()
      .required(),
    userPw: Joi.string().required()
  });

  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
    ctx.status = 400;
    return;
  }

  const { userId, userPw } = ctx.request.body;

  let account = null;
  let validate = null;
  try {
    // 아이디로 계정 찾기
    account = await Users.selectUserById(userId);
    validate = await Users.validatePassword(userId, userPw);
  } catch (e) {
    ctx.throw(500, e);
  }

  if (!account || !validate) {
    ctx.status = 403; //Forbidden
    return;
  }

  let token = null;
  try {
    token = await Users.generateToken(userId);
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.cookies.set("access_token", token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
  ctx.body = account;
};

exports.exists = async ctx => {
  const { value } = ctx.params;
  let account = undefined;

  try {
    account = await Users.selectUserById(value);
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.body = {
    exists: account !== undefined
  };
};

exports.logout = async ctx => {
  ctx.cookies.set("access_token", null, {
    maxAge: 0,
    httpOnly: true
  });
  ctx.status = 204;
};

exports.check = ctx => {
  const { user } = ctx.request;
  if (!user) {
    ctx.status = 403; // Forbidden
    return;
  }
  ctx.body = user;
};

exports.sendMail = ctx => {
  ctx.body = "test";
};
