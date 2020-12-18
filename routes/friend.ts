import { v4 } from "uuid";
import { Message, Notify } from "../common/const/interface";
import {
  addFriend,
  delFriend,
  getAll,
  friendShip,
} from "../common/controllers/friend";
import { getNotifyByMsgIdFromRedis, delNtyByValue } from "../common/IM/utils";

const router = require("koa-router")();
const { Notify: NotifyModel } = require("../common/models");

router.prefix("/friend");

/**
 * @description: 好友操作
 * @param {required 1|2|3|4} type	好友操作类型	1：添加好友	2：删除好友 3：同意 4：拒绝
 * @param {number} friendId	好友的userId
 * @param {string} remark 备注
 * @param {json string} ext 扩展字段
 * @param {string} msgId 通知的id
 * @return:
 */
router.post("/handle", async (ctx, next) => {
  const { type, friendId, remark, ext, msgId } = ctx.request.body;

  if (!type) {
    return (ctx.body = {
      code: 400,
      msg: "type cannot be emptyed",
    });
  }

  switch (type) {
    case 1:
      if (!friendId)
        return (ctx.body = {
          code: 400,
          msg: "type cannot be emptyed",
        });

      const isFriend = await friendShip({ userId: ctx.userId, friendId });
      if (isFriend) {
        /** 已经是好友 */
        return (ctx.body = {
          code: 400,
          msg: "It's already a good friend relationship, don't repeat submit.",
        });
      }

      const notify: Notify = {
        msgId: v4(),
        type: 1,
        sender: ctx.userId,
        reciver: friendId,
        status: 0,
        time: Date.now(),
        remark,
        ext,
      };

      const result = (global as any).ChatInstance.sendNotify(
        ctx,
        friendId,
        notify
      );

      if (result === "failed")
        return (ctx.body = {
          code: 500,
          msg: "failed",
        });

      return (ctx.body = {
        code: 200,
        msg: "successed",
      });
    case 2:
      await delFriend(ctx, next);
      return;
    case 3:
      /** 同意加为好友 */
      if (!msgId)
        return (ctx.body = {
          code: 400,
          msg: "msgId cannot be emptyed",
        });

      const { notify: nty, index } = await getNotifyByMsgIdFromRedis(
        ctx.redis.redis,
        ctx.userId,
        msgId
      );

      if (!nty)
        return (ctx.body = {
          code: 410,
          msg: "The notice has expired",
        });

      const { sender } = nty;

      const dbRes = await addFriend(ctx.userId, sender);

      if (!dbRes) return (ctx.body = { code: 500, msg: "db error" });

      // 添加成功
      ctx.body = {
        code: 200,
        msg: "successed",
      };

      // 将缓存中的通知入库 并删除
      try {
        await NotifyModel.create({ ...nty, status: 2 });
      } catch (error) {
        // 通知入库失败
      }

      await delNtyByValue(ctx.redis.redis, ctx.userId, JSON.stringify(nty));
      return;
  }
});

router.post("", async () => {});

/**
 * @description: 获取好友列表
 * @param {type}
 * @return:
 */
router.post("/getAll", getAll);

module.exports = router;
