export const alert = (content) => {
	return new Promise((resolve, reject) => {
		uni.showModal({
			title: '提示',
			content: content,
			showCancel: false,
			confirmText: '确定',
			success: res => {
				resolve(res)
			}
		})
	})
}

export const confirm = (content) => {
	return new Promise((resolve, reject) => {
		uni.showModal({
			title: '提示',
			content: content,
			showCancel: true,
			cancelText: '取消',
			confirmText: '确定',
			success: res => {
				resolve(res)
			}
		})
	})
}

export const showLoading = (content, mask = true) => {
	uni.showLoading({
		title: content,
		mask: mask
	});
}

export const toast = (title) => {
	uni.showToast({
		title: title
	})
}