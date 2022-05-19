const getSwiper = require('./getSwiper/getSwiper')
const getInsideInformationList = require('./getInsideInformationList/getInsideInformationList')
const getInsideInformation = require('./getInsideinformation/getInsideInformation')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getSwiper':
      return await getSwiper.main(event, context);
    case 'getInsideInformationList':
      return await getInsideInformationList.main(event, context);
    case 'getInsideInformation':
      return await getInsideInformation.main(event, context);
  }
};