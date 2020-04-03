const apiServer = 'https://hkb.weishuapay.com/'

export default class Req {
	post(url, data = {}) {
		wx.showToast({
			title: '拼命加载',
			image: '/static/tabbar/home_selected.png',
			duration: 5000,
			mask: true
		})
		return new Promise((resolve, reject) => {
			uni.request({
				url: apiServer + url,
				header: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				method: 'POST',
				data: data,
				success: (response) => {
					// console.log(response.data)
					resolve(response.data)
				},
				fail: (error) => {
					reject(error)
				},
				complete: () => {
					wx.hideToast()
				}
			})
		})
	}
	
	get(url, data = {}) {
		wx.showToast({
			title: '马尼拉兔在奔跑',
			image: '/static/tabbar/home_selected.png',
			duration: 5000,
			mask: true
		})
		return new Promise((resolve, reject) => {
			uni.request({
				url: apiServer + url,
				method: 'GET',
				data: data,
				success: (response) => {
					console.log(response.data)
					resolve(response.data)
				},
				fail: (error) => {
					reject(error)
				},
				complete: () => {
					setTimeout(function() {
						wx.hideToast()
					}, 500)
				}
			})
		})
	}
}