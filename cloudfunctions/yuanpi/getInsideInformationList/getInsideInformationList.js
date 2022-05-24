const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  // 返回数据库查询结果
  return await db.collection('inside-information')
                  .where({
                    is_show: _.eq(event.isShow)
                  })
                  .orderBy('priority', 'desc')
                  .get()
};
