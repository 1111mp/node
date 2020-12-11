const router = require("koa-router")();
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const bcrypt = require("bcrypt");
const { User } = require("../common/models");
const { Op } = require("sequelize/lib/sequelize");
const { secretOrPrivateKey, tokenExp } = require("../config");

router.get("/", async (ctx, next) => {
  await ctx.render("index", {
    title: "Hello Koa 2ss!",
  });
});

/**
 * @description: 登录接口
 * @param {number} account 账号 手机号
 * @param {string} pwd 密码
 * @return:
 */
router.post("/login", async (ctx, next) => {
  console.log(ctx.request);
  const { account, pwd } = ctx.request.body;

  if (!account || !pwd) {
    ctx.body = {
      code: 401,
      msg: "account or pwd cannot be empty",
    };
    return;
  }

  let user = await User.findOne({
    attributes: [
      ["id", "userId"],
      "account",
      "pwd",
      "avatar",
      "email",
      ["createdAt", "regisTime"],
      ["updatedAt", "updateTime"],
    ],
    where: {
      account: {
        [Op.eq]: account,
      },
    },
  });

  if (!user) {
    ctx.body = {
      code: 403,
      msg: "please register first",
    };
    return;
  }

  user = user.toJSON();

  const isPwd = bcrypt.compareSync(pwd, user.pwd);
  if (isPwd) {
    // 密码正确 生成token和key 将token存在redis的key中 并将key返回给前端
    const key = v4();
    const token = jwt.sign(user, secretOrPrivateKey);
    ctx.redis.set(key, token, tokenExp);
    delete user["pwd"];
    ctx.body = {
      code: 200,
      token: key,
      data: user,
    };
  } else {
    // 密码错误
    ctx.body = {
      code: 403,
      msg: "Incorrect password",
    };
  }
});

/** 登出 */
router.post("/logout", async (ctx, next) => {
  const { token } = ctx.headers;

  // 清除redis中token的缓存
  ctx.redis.destroy(token);
});

module.exports = router;

export {};
