import Config from "../config";
import { setToken } from "../common/utils/auth";

const router = require("koa-router")();
const bcrypt = require("bcrypt");
const { User } = require("../common/models");
const { Op } = require("sequelize/lib/sequelize");

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
  const { account, pwd } = ctx.request.body;

  if (!account || !pwd) {
    return (ctx.body = {
      code: 401,
      msg: "account or pwd cannot be empty",
    });
  }

  try {
    let user = (
      await User.findOne({
        attributes: [
          ["id", "userId"],
          "account",
          "pwd",
          "avatar",
          "email",
          "regisTime",
          "updateTime",
        ],
        where: {
          account: {
            [Op.eq]: account,
          },
        },
      })
    ).toJSON();

    if (!user) {
      return (ctx.body = {
        code: 403,
        msg: "please register first",
      });
    }

    const isPwd = bcrypt.compareSync(pwd, user.pwd);
    if (isPwd) {
      // 密码正确 生成token和key 将token存在redis的key中 并将key返回给前端
      const key = await setToken(ctx.redis.redis, user, Config.tokenExp);

      if (key === "failed")
        return (ctx.body = { code: 500, msg: "redis error" });

      delete user["pwd"];

      return (ctx.body = {
        code: 200,
        token: key,
        data: user,
      });
    } else {
      // 密码错误
      return (ctx.body = {
        code: 403,
        msg: "Incorrect password",
      });
    }
  } catch (error) {
    return (ctx.body = {
      code: 500,
      msg: `${error.name}: ${error.message}`,
    });
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
