<template>
	<view class="dice">
		<view class="score-board" v-if="count !== 0 && capOpen">
			<view class="score">
				<text>总点数</text>
				<text>{{count}}</text>
			</view>
		</view>
		<view class="dice-num-board">
			<picker mode="selector" :value="defaultDiceIndex" :range="diceArr" @change="setDiceNumber">
				<view class="selector">
					<text class="num_title">骰子数</text>
					<text>{{diceArr[defaultDiceIndex]}} 个</text>
				</view>
			</picker>
		</view>

		<view :class="['container', shaking ? 'shaking' : '']">
			<image class="dice__bottom" :src="currentSkin.bottom" mode="widthFix" :style="[currentSkin.bottomSty]"></image>
			<view :class="[
				'dice-can',
				diceNumber === 1 ? 'one-dices' : '',
				diceNumber === 2 ? 'two-dices' : '',
				diceNumber === 3 ? 'three-dices' : '',
				diceNumber === 4 ? 'four-dices' : '',
				diceNumber === 5 ? 'five-dices' : '',
				diceNumber === 6 ? 'six-dices' : ''
				]">
				<block v-for="(point, index) in pointArr" :key="index">
					<image class="dice__item" :src="imageSrc[point - 1]" mode="widthFix"></image>
				</block>
			</view>
			<image 
				:class="['dice__cap', capOpen ? 'open' : '']" 
				:src="currentSkin.cap" 
				:style="[currentSkin.capSty, capOpen ? currentSkin.capOpenSty : '']"
				mode="widthFix" 
			@tap="!shaking && (capOpen = !capOpen)"></image>
		</view>

		<view class="other-btn">
			<button class="btn custom-button online-room" open-type="getUserInfo" @getuserinfo="modalOpen">
				<text>联机房间</text>
			</button>
			<button class="btn custom-button get-skins" @tap="toSkinSelect" type="default">
				<text>领取皮肤</text>
			</button>
		</view>

		<view class="tabbar">
			<button class="btn custom-button" open-type="share">
				<text>邀请好友</text>
			</button>
			<button class="btn custom-button" type="default" @tap="!shaking && shake()">
				<text>摇一摇</text>
			</button>
		</view>
		
		<view :class="['create-or-join-room', createRoomShow ? 'show' : '']">
			<input type="number" v-model="roomId" value="" placeholder="请输入房间号" />
			<button type="default" @tap="join"><text>加入</text></button>
			<button type="default" @tap="createRoom"><text>创建</text></button>
			<button type="default" @tap="createRoomShow = !createRoomShow"><text>关闭</text></button>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import { joinRoom, sharePicUrl } from '../../utils/api.js'
	import { alert } from '../../utils/dialog.js'
	export default {
		data() {
			return {
				imageSrc: ['../../static/dice_2/1@2x.png', '../../static/dice_2/2@2x.png', '../../static/dice_2/3@2x.png',
					'../../static/dice_2/4@2x.png', '../../static/dice_2/5@2x.png', '../../static/dice_2/6@2x.png'
				],
				capOpen: true,
				diceNumber: 5,
				diceArr: [1,2,3, 4, 5, 6],
				defaultDiceIndex: 4,
				pointArr: [],
				count: 0,
				shaking: false,
				innerAudioContext: null,
				createRoomShow: false,
				roomId: ''
			};
		},
		computed: {
			...mapState(['skinList', 'skinIndex']),
			currentSkin() {
				return this.skinList[this.skinIndex]
			}
		},
		mounted() {
			this.randomDicePoints();
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
			join() {
				if(this.roomId === '') {
					alert('请输入房间号')
					return false
				}
				
				joinRoom({
					openId: this.$store.state.userInfo.openId,
					roomId: this.roomId
				}).then(res => {
					if(res.code === '0000') {
						uni.navigateTo({
						    url: '/pages/multiplayer/multiplayer?roomId=' + this.roomId,
								success: () => {
									this.roomId = ''
								}
						});
					} else if(res.code === '0001') {
						alert('该房间不存在！')
					}
				})
			},
			toSkinSelect() {
				uni.navigateTo({
					url: '/pages/skinSelect/skinSelect'
				})
			},
			randomDicePoints() {
				this.pointArr = []
				for (let i = 0; i < this.diceNumber; i++) {
					this.pointArr.push(this.random(1, 6))
				}

				this.count = this.pointArr.reduce((a, b) => a + b)
			},
			shake() {
				this.capOpen = false
				this.count = 0
				this.shaking = true
				this.innerAudioContext.play()
				wx.vibrateLong({
					success() {
						console.log('vibration');
					}
				})
				setTimeout(() => {
					this.shaking = false
					this.randomDicePoints();
				}, 1500)
			},
			setDiceNumber(e) {
				this.capOpen = true
				this.diceNumber = this.diceArr[+e.target.value]
				this.defaultDiceIndex = +e.target.value
				this.randomDicePoints()
			},
			modalOpen() {
				this.roomId = ''
				this.createRoomShow = true
				uni.getUserInfo({
					success: (data) => {
						console.log(data.userInfo);
						this.$store.state.userInfoPermitted = true
						this.$store.state.userInfo = data.userInfo
						this.$store.state.userInfo.openId = data.signature
					}
				})
			},
			random(min, max) {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			},
			createRoom() {
				
				uni.navigateTo({
					url: '/pages/multiplayer/multiplayer'
				})
			}
		},
		onShareAppMessage() {
			console.log(sharePicUrl);
			return {
				title: '来玩个骰子~',
				path: '/pages/diceTwo/diceTwo',
				imageUrl: sharePicUrl
			}
		}
	}
</script>

<style lang="scss">
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

	page {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		background-image: url(https://hkb.weishuapay.com/static/homebg.png);
		background-position: center;
		background-size: cover;
	}

	.dice {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
	}

	.other-btn {
		position: fixed;
		top: 20rpx;
		right: 20rpx;
		width: 180rpx;
		.btn {
			height: 55rpx;
			border-radius: 50rpx;
			margin-top: 20rpx;
		}
		.online-room {
			background: linear-gradient(to bottom, #a9f077, #0f920d);
			margin-bottom: 40rpx;
		}
		.get-skins {
			background: linear-gradient(to bottom, #f38370, #bb2b1c);
			&::before {
				background: linear-gradient(to bottom, #bc2e21, #ba291a);
			}
		}
	}

	.score-board {
		position: absolute;
		color: #FFFFFF;
		top: 120rpx;
		left: 20rpx;

		.score {
			display: flex;
			justify-content: space-around;
			flex-direction: column;
			align-items: center;
			width: 100rpx;
			padding-top: 20rpx;
			color: #eee;

			text:nth-child(1) {
				font-size: 13px;
				color: #8577a8;
			}

			text:nth-child(2) {
				font-size: 30px;
				font-weight: bold;
			}
		}
	}

	.container {
		width: 560rpx;
		height: 720rpx;
		position: relative;
		margin-top: 25vh;
		transform: scale(1.1);

		&.shaking {
			animation: shake 200ms ease-in-out infinite;
		}
	}

	.dice__cap {
		width: 409rpx;
		height: 619rpx;
		position: absolute;
		top: 0;
		left: 50%;
		transition: all .3s;
		transform: translateX(-50%);

		&.open {
			transform: translate(-50%, -50%);
		}
	}

	.dice__item {
		width: 78rpx;
		height: 78rpx;
		position: absolute;
	}

	.dice__bottom {
		width: 560rpx;
		height: 340rpx;
		position: absolute;
		bottom: 0;
		left: 0;
	}

	.dice-can {
		width: 560rpx;
		height: 340rpx;
		position: absolute;
		bottom: 0;
		left: 0;
		
		&.one-dices {
			.dice__item:nth-child(1) {
				left: 250rpx;
				top: 86rpx;
			}
		}
		
		&.two-dices {
			.dice__item:nth-child(1) {
				left: 160rpx;
				top: 120rpx;
			}
			
			.dice__item:nth-child(2) {
				left: 320rpx;
				top: 85rpx;
			}
		}

		&.three-dices {
			.dice__item:nth-child(1) {
				left: 160rpx;
				top: 120rpx;
			}

			.dice__item:nth-child(2) {
				left: 235rpx;
				top: 55rpx;
			}

			.dice__item:nth-child(3) {
				left: 317rpx;
				top: 105rpx;
			}
		}

		&.four-dices {
			.dice__item:nth-child(1) {
				left: 140rpx;
				top: 120rpx;
			}

			.dice__item:nth-child(2) {
				left: 215rpx;
				top: 55rpx;
			}

			.dice__item:nth-child(3) {
				left: 290rpx;
				top: 140rpx;
			}

			.dice__item:nth-child(4) {
				left: 360rpx;
				top: 75rpx;
			}
		}

		&.five-dices {
			.dice__item:nth-child(1) {
				left: 120rpx;
				top: 110rpx;
			}

			.dice__item:nth-child(2) {
				left: 200rpx;
				top: 55rpx;
			}

			.dice__item:nth-child(3) {
				left: 230rpx;
				top: 140rpx;
			}

			.dice__item:nth-child(4) {
				left: 295rpx;
				top: 55rpx;
			}

			.dice__item:nth-child(5) {
				left: 362rpx;
				top: 124rpx;
			}
		}

		&.six-dices {
			.dice__item:nth-child(1) {
				left: 105rpx;
				top: 110rpx;
			}

			.dice__item:nth-child(2) {
				left: 200rpx;
				top: 55rpx;
			}

			.dice__item:nth-child(3) {
				left: 200rpx;
				top: 140rpx;
			}

			.dice__item:nth-child(4) {
				left: 295rpx;
				top: 55rpx;
			}

			.dice__item:nth-child(5) {
				left: 292rpx;
				top: 138rpx;
			}

			.dice__item:nth-child(6) {
				left: 376rpx;
				top: 104rpx;
			}
		}
	}

	.tabbar {
		position: fixed;
		bottom: 50rpx;
		left: 0;
		width: 100%;
		height: 100rpx;
		display: flex;
		justify-content: space-around;

		.btn {
			width: 312rpx;
			height: 80rpx;
			margin: 0;
			padding: 0;
			border: none;
			border-radius: 50rpx;
			background: linear-gradient(to bottom, #f5dc56, #e07d10);
			box-shadow: 0 0 3rpx 7rpx #4f4f4d, 0 0 6rpx 10rpx #595e57;
			&::before {
				background: linear-gradient(to bottom, #f1983a, #e07d10);
			}
			text {
				font-size: 16px;
			}
		}
	}

	.dice-num-board {
		position: absolute;
		left: 20rpx;
		top: 20rpx;
		color: #FFFFFF;
		width: 100rpx;

		.selector {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			color: #8577a8;
			
			.num_title::after {
				content: '▼';
				color: #FFFFFF;
				position: absolute;
				left: 100%;
			}

			text:nth-child(1) {
				font-size: 12px;
			}

			text:nth-child(2) {
				padding-top: 10rpx;
				font-size: 16px;

			}
		}
	}
	
	.create-or-join-room {
		padding: 100rpx;
		background-color: #FFFFFF;
		position: fixed;
		top: 120%;
		left: 50%;
		transform: translate(-50%, -50%);
		transition: all .3s;
		opacity: 0;
		width: 70%;
		box-sizing: border-box;
		border-radius: 20rpx;
		background: linear-gradient(to top, #2a0c4e, #6922d3);
		border: 3rpx solid #ffffff;
		text {
			width: 100%;
			color: #FFFFFF;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-weight: bold;
			font-size: 12px;
			font-style: italic;
		}
		button {
			color: #FFFFFF;
			font-size: 14px;
			padding: 32rpx;
			border: none;
			border-radius: 0;
			background: none;
			margin-top: 40rpx;
			border: 1rpx solid #aada85;
			border-radius: 50rpx;
			background: linear-gradient(to bottom, #f5dc56, #e07d10);
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
				background: linear-gradient(to bottom, #f1983a, #e07d10);
			}
		}
		
		input {
			background-color: #000;
			text-align: center;
			padding: 10rpx;
			border-radius: 14rpx;
			color: #FFFFFF;
			margin-bottom: 20rpx;
		}
		
		&.show {
			top: 50%;
			opacity: 1;
		}
	}
</style>
