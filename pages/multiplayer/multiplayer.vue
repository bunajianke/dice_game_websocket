<template>
	<view class="main">
		<view class="toolbar">
			<button class="invite-friend" open-type="share" type="default">邀请</button>
			<button class="quit-room" type="default" @tap="quitRoom">离开</button>
		</view>
		<view class="player-list">
			<scroll-view scroll-y="true" show-scrollbar="true" style="height: 50vh;">
				<view class="player-list">
					<view class="player" v-for="(player, index) in playerList" :key="index">
						<view class="player-info">
							<view class="avatar">
								<image :src="player.img" mode="widthFix" class="avatar-img"></image>
							</view>
							<view class="info">
								<view class="nickname">{{player.name}}</view>
							</view>
						</view>
						<view :class="[
							'player-dice-points',
							player.status === '-1' ? 'no-ready' : '',
							player.status === '0' ? 'ready' : '',
							player.status === '1' ? 'shaked' : '',
							player.status === '2' ? 'published drop-down' : '',
							]">
								<view v-if="player.points.length && player.status == '2'" class="little-dices">
									<image class="little-dice-item" :src="point | setDiceSrc" mode="widthFix" v-for="(point, key) in player.points" :key="key"></image>
								</view>
								<view 
									v-else 
									class="'status'">{{player.status | setStatus}}
								</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<view :class="['little-dice-area', capOpen ? 'cap-open' : '', shaking ? 'shaking' : '']">
			<image class="bottom" src="../../static/little_bottom.png" mode="widthFix"></image>
			<image @tap="(currentStatus === '1') && !shaking && (capOpen = !capOpen)" class="cap" src="../../static/little_cap.png" mode="widthFix"></image>
			<view class="result-bar">
				<image v-if="pointsArr.length" class="little-dice-item" :src="point | setDiceSrc" mode="widthFix" v-for="(point, key) in pointsArr" :key="key"></image>
			</view>
		</view>
		
		<view class="gamebar">
			<button class="ready" v-if="currentStatus === '-1'" type="default" @tap="gameReady"><text>准 备</text></button>
			<button class="to-shake" v-else-if="currentStatus === '0'" :disabled="!allPlayerReady" type="default" @tap="shake"><text>摇 一 摇</text></button>
			<button class="publish" v-else-if="currentStatus === '1'" :disabled="!allPlayerShaked" type="default" @tap="openCap"><text>公 布 点 数</text></button>
			<button class="onemore" v-else-if="currentStatus === '4'" :disabled="!allPlayerOpend" type="default" @tap="oneMoreRound"><text>再 来 一 局</text></button>
		</view>
		
		<uni-popup class="permitted-modal" :maskClick="false" ref="permitted" type="center">
			<button type="default" open-type="getUserInfo" @getuserinfo="getUserInfo">请授权用户信息</button>
		</uni-popup>
		
		<an-layer ref="anRef" autoClose="true" timer="3" type="info"></an-layer>
	</view>
</template>

<script>
	import { playRegister, createRoom, joinRoom, sharePicUrl } from '../../utils/api.js'
	import { mapState } from 'vuex'
	import { alert, confirm } from '../../utils/dialog.js'
	
	import uniPopup from '../../components/uni-popup/uni-popup.vue'
	export default {
		components: {
			uniPopup
		},
		data() {
			return {
				socketOpen: false,
				optionType: 'create',
				points: '',
				currentStatus: '-1', // -1 未准备， 0 已准备， 1 已摇， 2 开， 4 再开一局
				// currentStatus: '1',
				allPlayerShaked: false,
				allPlayerOpend: false,
				allPlayerReady: false,
				capOpen: false,
				shaking: false,
				innerAudioContext: null
			};
		},
		computed: {
			...mapState(['userInfo', 'playerList', 'userInfoPermitted', 'roomId']),
			pointsArr() {
				return this.points.split('')
			}
		},
		onLoad(initData) {
			console.log(initData);
			//	带 roomId 且有用户信息，直接加入房间
			// if(true) {
			if(initData.roomId && this.userInfoPermitted) {
				this.optionType = 'join'
				this.$store.state.roomId = initData.roomId
				this.setRoomTitle(initData.roomId)
				this.infoRegister()
				return
			}
			
			// 带 roomid 但是没有用户信息
			if(initData.roomId && !this.userInfoPermitted) {
				// 打开弹窗
				// 点击获取用户信息，触发getUserInfo()，infoRegister()
				this.optionType = 'join'
				this.$store.state.roomId = initData.roomId
				this.setRoomTitle(initData.roomId)
				this.$refs.permitted.open();
				return
			}
			
			if(!initData.roomId && this.userInfoPermitted) {
				/*
					已获取用户信息
					注册信息
					获取房间号
					创建长连接
				*/
				this.infoRegister()
				return
			}
			
			if(!initData.roomId && !this.userInfoPermitted) {
				// 没有房间id，没有用户信息
				this.$refs.permitted.open();
				return
			}
		},
		onHide() {
			console.log('房间已隐藏')
		},
		beforeDestroy() {
			uni.closeSocket({
				success: (res) => {
					console.log('关闭socket', res);
				}
			})
		},
		mounted() {
			this.innerAudioContext = uni.createInnerAudioContext();
			this.innerAudioContext.autoplay = false;
			this.innerAudioContext.src = 'https://hkb.weishuapay.com/update/1683.wav'
			this.innerAudioContext.onPlay(() => {
				console.log('开始播放');
			});
			this.innerAudioContext.onError((res) => {
				console.log(res.errMsg);
				console.log(res.errCode);
			});
		},
		methods: {
			oneMoreRound() {
				if(this.allPlayerOpend) {
					this.sendSocketMessage(4, '重置房间，再来一局')
				}
			},
			quitRoom() {
				confirm('确定离开游戏房间？').then(res => {
					if(res.confirm) {
						uni.switchTab({
							url: '/pages/diceTwo/diceTwo'
						})
					}
				})
			},
			setRoomTitle(roomId) {
				uni.setNavigationBarTitle({
				    title: '房间号：' + roomId
				});
			},
			infoRegister() {
				playRegister({
					img: this.userInfo.avatarUrl,
					name: this.userInfo.nickName,
					city: this.userInfo.city,
					openId: this.userInfo.openId
				}).then(res => {
					console.log('信息注册', res);
					if(res.code == '0000') {
						// 创建房间
						if(this.optionType == 'create') {
							this.toCreateGameRoom()
						} else if(this.optionType == 'join') {
							// 加入房间
							joinRoom({
								openId: this.userInfo.openId,
								roomId: this.roomId
							}).then(res => {
								this.websocketStart().then(res => {
									if(res.socketOpen) {
										this.setRoomTitle(this.roomId)
										this.sendSocketMessage(-1, '加入房间，发送我的信息')
									}
								}).catch(err => {
									console.log(err);
								})
							})
						}
					}
				})
			},
			toCreateGameRoom() {
				createRoom({
					openId: this.userInfo.openId
				}).then(res => {
					console.log('创建房间', res);
					if(res.code == '0000') {
						this.$store.state.roomId = res.roomId
						this.setRoomTitle(res.roomId)
						this.websocketStart().then(res => {
							if(res.socketOpen) {
								this.sendSocketMessage(-1, '创建房间，发送我的信息')
							}
						});
					}
				})
			},
			websocketStart() {
				return new Promise((resolve, reject) => {
					// 建立连接
					uni.connectSocket({
						// url: 'ws://113.106.89.99:9502'
						// url: 'ws://hkb.weishuapay.com:9502'
						url: 'wss://hkb2.weishuapay.com'
					})
					
					// websocket 连接开启
					uni.onSocketOpen(() => {
						// 推送进入房间信息
						this.socketOpen = true
						resolve({socketOpen: true})
					})
					
					// 连接失败
					uni.onSocketError(function(err){
						console.log('err', err);
						reject({socketOpen: false})
					})
					
					// 接受广播
					uni.onSocketMessage((res) => {
						console.log('广播:', JSON.parse(res.data));
						// 更新玩家列表
						let data = JSON.parse(res.data)
						if(data.code == '0000' && data.state == 'update') {
							data.msg && this.$refs.anRef.show(data.msg)
							this.currentStatus = data.status
							
							if(data.data.length ===  1) {
								this.allPlayerShaked = true
							}
							
							// 当前连接已断开
							if(data.status === '-2') {
								alert('当前连接已断开').then(res => {
									if(res.confirm) {
										uni.switchTab({
											url: '/pages/diceTwo/diceTwo'
										})
									}
								})
							}
							
							// 所有人准备
							if(data.data.length && data.data.every(player => player.status === '0')) {
								this.allPlayerReady = true
								console.log(this.allPlayerReady);
							}
							
							// 所有人已摇
							if(data.data.length >= 2 && this.checkAllPlayerStatus(data.data)) {
								this.allPlayerShaked = true
							}
							
							// 有一个玩家点了再来一局
							if(data.status === '2') {
								this.currentStatus = '4'
								this.points = ''
								this.capOpen = false
								this.allPlayerOpend = false
								this.allPlayerReady = false
								this.allPlayerShaked = false
							}
							
							// 所有人都公布了点数
							if(data.data.length && data.data.every(player => player.status === '2')) {
								this.allPlayerOpend = true
							}
							
							this.$store.dispatch('updatePlayerList', this.dealWithPlayerList(data.data))
							console.log(this.playerList);
						}
					})
				})
			},
			checkAllPlayerStatus(players) {
				return players.length && players.every((player) => player.status === '1')
			},
			dealWithPlayerList(players) {
				players.forEach((item, index) => {
					if(typeof item.points === 'string') {
						item.points = item.points.split('')
					}
				})
				return players.sort((a, b) => a.timestamp - b.timestamp)
			},
			sendSocketMessage(status, desc) {
				let msg = `roomId=${this.roomId};status=${status};name=${this.userInfo.nickName};img=${this.userInfo.avatarUrl};openId=${this.userInfo.openId};point=${this.points}`
				uni.sendSocketMessage({
					data: msg,
					success: (res) => {
						console.log(desc, res);
					}
				})
			},
			getUserInfo() {
				uni.getUserInfo({
					success: (data) => {
						console.log('获取用户信息', data);
						this.$store.state.userInfoPermitted = true
						this.$store.state.userInfo = data.userInfo
						this.$store.state.userInfo.openId = data.signature
						this.$refs.permitted.close();
						this.infoRegister()
					}
				})
			},
			gameReady() {
				if(this.socketOpen) {
					this.capOpen = false
					this.sendSocketMessage(0, '准备')
				}
			},
			shake() {
				this.shaking = true
				this.innerAudioContext.play()
				wx.vibrateLong({
					success() {
						console.log('vibration');
					}
				})
				setTimeout(() => {
					this.shaking = false
				}, 1500)
				
				this.points = '' // 重置点数
				for(let i=0; i<6; i++) {
					this.points += this.randomNum(1,6)
				}
				this.points = this.points.split('').sort((a, b) => a - b).join('');
				console.log(this.points);
				
				if(this.socketOpen) {
					this.sendSocketMessage(1, '摇骰子')
				}
			},
			openCap() {
				if(this.socketOpen) {
					this.sendSocketMessage(2, '公布点数')
				}
			},
			randomNum(min, max) {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}
		},
		filters: {
			setStatus(state) {
				switch(state) {
					case '-1': return '未准备';break;
					case '0': return '已准备';break;
					case '1': return '已摇骰盅';break;
					case '2': return '开';break;
					default: {};break;
				}
			},
			setDiceSrc(point) {
				return `../../static/little_dice/${point}@2x.png`
			}
		},
		onShareAppMessage() {
			return {
				title: '来玩个骰子~',
				path: '/pages/multiplayer/multiplayer?roomId=' + this.$store.state.roomId,
				imageUrl: sharePicUrl
			}
		}
	}
</script>

<style lang="scss">
	@keyframes drop {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(0);
		}
	}
	@keyframes shake {
		0% {
			transform: translate(0px, 0px) rotate(0deg) scale(1);
		}
	
		20% {
			transform: translate(5rpx, -10rpx) rotate(-1.5deg) scale(1);
		}
	
		40% {
			transform: translate(-10rpx, 00rpx) rotate(-0.5deg) scale(1);
		}
	}
	.shaking {
		animation: shake 200ms ease-in-out infinite;
	}
	page {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		color: #FFFFFF;
		background: radial-gradient(ellipse, #b513ff, #6d00e0);
	}
	.main {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}
	.gamebar {
		position: fixed;
		bottom: 50rpx;
		left: 40rpx;
		width: calc(100vw - 80rpx);
		button {
			width: 220rpx;
			height: 80rpx;
			border-radius: 50rpx;
			margin: 0 auto;
			padding: 0;
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			border: 1rpx solid #aada85;
			background: linear-gradient(to bottom, #a9f077, #0f920d);
			box-shadow: 0 0 3rpx 7rpx #4f4f4d, 0 0 6rpx 10rpx #595e57;
			
			&:active {
				text {
					text-shadow: 2rpx 2rpx 10rpx #a56d1b;
				}
			}
			
			&[disabled] {
				background: #C0C0C0;
				&::before {
					background: #999999;
				}
				text {
					color: #333;
				}
			}
			
			text {
				width: 100%;
				color: #FFFFFF;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				font-weight: bold;
				font-size: 16px;
				font-style: italic;
			}
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
			// green
		}
		.to-shake { // red
			background: linear-gradient(to bottom, #f38370, #bb2b1c);
			&::before {
				background: linear-gradient(to bottom, #bc2e21, #ba291a);
			}
		}
		.publish { // red
			background: linear-gradient(to bottom, #f38370, #bb2b1c);
			&::before {
				background: linear-gradient(to bottom, #bc2e21, #ba291a);
			}
		}
		.onemore { // yellow
			background: linear-gradient(to bottom, #f5dc56, #e07d10);
			&::before {
				background: linear-gradient(to bottom, #f1983a, #e07d10);
			}
		}
	}
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx 20rpx;
		button {
			color: #FFFFFF;
			font-size: 14px;
			margin: 0;
			padding: 0;
			border: none;
			border-radius: 0;
			background: none;
			line-height: 2;
			&::after {
				content: "";
			}
		}
		.invite-friend {
			width: 160rpx;
			border-radius: 50rpx;
			color: #f1923b;
			border: 1rpx solid #f1923b;
		}
		.quit-room {
			width: 160rpx;
			border-radius: 50rpx;
			border: 1rpx solid #fff;
		}
	}
	.player-list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		flex: 1;
		align-items: flex-start;
		.player {
			width: 50%;
			display: flex;
			flex-direction: column;
			padding: 24rpx;
			box-sizing: border-box;
			align-items: flex-start;
			.player-info {
				display: flex;
				.avatar {
					width: 90rpx;
					height: 90rpx;
					margin-right: 20rpx;
					.avatar-img {
						width: 90rpx;
						height: 90rpx;
						border-radius: 50%;
					}
				}
				&:nth-child(2n) {
					flex-direction: row-reverse;
					.avatar {
						margin-right: 0;
						margin-left: 20rpx;
					}
				}
				.info {
					display: flex;
					flex-direction: column;
					justify-content: center;
					.nickname {
						font-size: 14px;
					}
					.status {
						font-size: 12px;
					}
				}
			}
			.player-dice-points {
				width: 100%;
				height: 80rpx;
				margin-top: 20rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 20rpx;
				background: rgba(0,0,0,.7);
				overflow: hidden;
				color: #fff;
				transition: all .3s;
				&.no-ready {
					background: rgba(247,141,63,.7);
				}
				&.ready {
					background: rgba(252,210,113,.7);
				}
				&.shaked {
					background: rgba(43,187,216,.7);
				}
				&.published {
					background: rgba(0,0,0,.7);
				}
				
				&.drop-down {
					.little-dice-item {
						animation-name: drop;
						animation-duration: 250ms;
					}
					.little-dice-item:nth-child(1) {
						animation-delay: 0;
					}
					.little-dice-item:nth-child(2) {
						animation-delay: 50ms;
					}
					.little-dice-item:nth-child(3) {
						animation-delay: 100ms;
					}
					.little-dice-item:nth-child(4) {
						animation-delay: 150ms;
					}
					.little-dice-item:nth-child(5) {
						animation-delay: 200ms;
					}
					.little-dice-item:nth-child(6) {
						animation-delay: 250ms;
					}
				}
				
				.little-dices {
					display: flex;
					align-items: center;
				}
				.little-dice-item {
					transition: all .3s;
					width: 40rpx;
					height: 40rpx;
					&:not(:last-child) {
						margin-right: 10rpx;
					}
				}
			}
		}
	}
	.little-dice-area {
		flex: 1;
		position: relative;
		
		&.cap-open {
			.cap {
				transform: translate(-50%, -40%);
			}
			.bottom {
				transform: translate(-50%, 10%);
			}
			.result-bar {
				opacity: 1;
				transform: translate(-50%, 30%);
			}
		}
		.cap, .bottom, .result-bar {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			transition: all .2s;
		}
		.cap {
			width: 218rpx;
			height: 328rpx;
			top: 65rpx;
			z-index: 999;
		}
		.bottom {
			width: 298rpx;
			height: 180rpx;
			top: 275rpx;
		}
		.result-bar {
			top: 218rpx;
			width: 400rpx;
			padding: 20rpx;
			background: rgba(0,0,0,.8);
			border-radius: 20rpx;
			opacity: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			.little-dice-item {
				width: 60rpx;
				height: 60rpx;
				&:not(:last-child) {
					margin-right: 20rpx;
				}
			}
		}
	}
</style>
