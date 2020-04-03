<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			let idx = uni.getStorageSync('SKIN_INDEX')
			if(idx) {
				this.$store.state.skinIndex = idx
				this.$store.state.skinList.forEach((item, index) => {
					item.selected = false
					if(index === idx) {
						item.selected = true
					}
				})
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	.custom-button {
		margin: 0 auto;
		padding: 0;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1rpx solid #aada85;
		background: linear-gradient(to bottom, #a9f077, #0f920d);
		box-shadow: 0 0 3rpx 7rpx #4f4f4d, 0 0 6rpx 10rpx #595e57;
		&::after {
			content: none;
		}
		&::before {
			content: ' ';
			position: absolute;
			border-radius: 50rpx;
			bottom: 0;
			left: 3%;
			width: 94%;
			height: 50%;
			background: linear-gradient(to bottom, #0e9a09, #0c8f0a);
		}
		text {
			width: 100%;
			color: #FFFFFF;
			font-weight: bold;
			font-style: italic;
			font-size: 14px;
			z-index: 999;
			text-shadow: -2rpx -2rpx 4rpx #a56d1b;
		}
		&:active {
			text {
				text-shadow: 2rpx 2rpx 10rpx #a56d1b;
			}
		}
	}
</style>
