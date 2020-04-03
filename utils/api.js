import Req from './request.js'

const post = new Req().post
const get = new Req().get

module.exports = {
	// sign up
	// openId, name, city, img
	playRegister: (data) => post('app/dice/insertInfo', data),
	// openId
	createRoom: (data) => post('app/dice/createdRoom', data),
	// openId, roomId
	joinRoom: (data) => post('app/dice/player', data),
	// 注销
	deleteRoom: (data) => post('app/dice/deleteRoom', data),
	// 退出 roomID openid
	quitRoom: (data) => post('app/dice/outRoom', data),
	
	sharePicUrl: 'https://hkb.weishuapay.com/static/20200325150927.png',
	baseUrl: 'https://hkb.weishuapay.com/static/'
}