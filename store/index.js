import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
	skinList: [
		{
			id: 1,
			cap: "https://hkb.weishuapay.com/static/skins/3/cap.png",
			bottom: "https://hkb.weishuapay.com/static/skins/3/button.png",
			thumbnail: "https://hkb.weishuapay.com/static/skins/3/thumbnail.png",
			skin_desc: '默认皮肤',
			selected: true,
			capSty: {},
			bottomSty: {},
			capOpenSty: {}
		},
		{
			id: 2,
			cap: "https://hkb.weishuapay.com/static/skins/2/cap.png",
			bottom: "https://hkb.weishuapay.com/static/skins/2/button.png",
			thumbnail: "https://hkb.weishuapay.com/static/skins/2/thumbnail.png",
			skin_desc: '青春骰',
			selected: false,
			capSty: {
				width: "470rpx"
			},
			bottomSty: {},
			capOpenSty: {}
		},
		{
			id: 3,
			cap: "https://hkb.weishuapay.com/static/skins/1/cap.png",
			bottom: "https://hkb.weishuapay.com/static/skins/1/button.png",
			thumbnail: "https://hkb.weishuapay.com/static/skins/1/thumbnail.png",
			skin_desc: '青花瓷',
			selected: false,
			capSty: {
				top: "315rpx"
			},
			bottomSty: {},
			capOpenSty: {
				transform: "translate(-50%, -80%)"
			}
		},
		{
			id: 4,
			cap: "https://hkb.weishuapay.com/static/orange_cap.png",
			bottom: "https://hkb.weishuapay.com/static/orange_bottom.png",
			thumbnail: "https://hkb.weishuapay.com/static/orange_thumbnail.png",
			skin_desc: '橙色',
			selected: false,
			capSty: {
				top: "16rpx"
			},
			bottomSty: {},
			capOpenSty: {
				transform: "translate(-50%, -50%)"
			}
		},
		{
			id: 5,
			cap: "https://hkb.weishuapay.com/static/silver_cap.png",
			bottom: "https://hkb.weishuapay.com/static/silver_bottom.png",
			thumbnail: "https://hkb.weishuapay.com/static/silver_thumbnail.png",
			skin_desc: '银白',
			selected: false,
			capSty: {
				top: "50rpx"
			},
			bottomSty: {},
			capOpenSty: {
				transform: "translate(-50%, -50%)"
			}
		},
		{
			id: 6,
			cap: "https://hkb.weishuapay.com/static/cyan_cap.png",
			bottom: "https://hkb.weishuapay.com/static/cyan_bottom.png",
			thumbnail: "https://hkb.weishuapay.com/static/cyan_thumbnail.png",
			skin_desc: '青色',
			selected: false,
			capSty: {
				top: "40rpx"
			},
			bottomSty: {},
			capOpenSty: {
				transform: "translate(-50%, -50%)"
			}
		},
		{
			id: 7,
			cap: "https://hkb.weishuapay.com/static/wood_cap.png",
			bottom: "https://hkb.weishuapay.com/static/wood_bottom.png",
			thumbnail: "https://hkb.weishuapay.com/static/wood_thumbnail.png",
			skin_desc: '原木',
			selected: false,
			capSty: {
				width: "468rpx",
				top: "-50rpx"
			},
			bottomSty: {
				width: "600rpx",
				left: "-24rpx",
				bottom: "-20rpx"
			},
			capOpenSty: {
				transform: "translate(-50%, -50%)"
			}
		},
		{
			id: 8,
			cap: "https://hkb.weishuapay.com/static/pearl_cap.png",
			bottom: "https://hkb.weishuapay.com/static/pearl_bottom.png",
			thumbnail: "https://hkb.weishuapay.com/static/pearl_thumbnail.png",
			skin_desc: '珍珠白',
			selected: false,
			capSty: {
				top: "40rpx"
			},
			bottomSty: {
				width: "620rpx",
				bottom: "-60rpx",
				left: "-30rpx"
			},
			capOpenSty: {
				transform: "translate(-50%, -50%)"
			}
		},
		{
			id: 9,
			cap: "https://hkb.weishuapay.com/static/marble_cap.png",
			bottom: "https://hkb.weishuapay.com/static/marble_bottom.png",
			thumbnail: "https://hkb.weishuapay.com/static/marble_thumbnail.png",
			skin_desc: '大理石',
			selected: false,
			capSty: {
				top: "40rpx"
			},
			bottomSty: {
				bottom: "-20rpx"
			},
			capOpenSty: {
				transform: "translate(-50%, -50%)"
			}
		}
	],
	skinIndex: 0,
	userInfoPermitted: false,
	userInfo: {},
	roomId: '',
	playerList: []
}

const mutations = {
	'UPDATE_PLAYERLIST': (state, list) => {
		state.playerList = list
	}
}

const actions = {
	updatePlayerList({commit}, list) {
		commit('UPDATE_PLAYERLIST', list)
	}
}

export default new Vuex.Store({
	state,
	mutations,
	actions
})
