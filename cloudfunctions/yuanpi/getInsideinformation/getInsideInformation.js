const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  // 返回数据库查询结果
  return await db.collection('inside-information')
                  .where({
                    serial_number: _.eq(event.serial_number),
                    version: _.eq(event.version)
                  })
                  .field({
                    banner: true,
                    message: true,
                    title: true,
                  })
                  .get()
};
