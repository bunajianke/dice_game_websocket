<template>
	<view class="container">
		<view class="wheel">
			<view class="item-wrapper" :style="{
				transform: `rotate(${deg}deg)`
			}">
				<image class="bg" src="../../static/wheel-bg.png" mode="widthFix"></image>
				<view class="inner">
					<view class="item" v-for="(item, index) in result" :key="index" :style="{
						transform: `rotate(${item.deg}deg)`
					}">
						<text>{{item.text}}</text>
					</view>
				</view>
			</view>
			<image @tap="begin" class="pointer" src="../../static/pointer.png" mode="widthFix"></image>
		</view>
		
		<uni-popup class="result-modal" :maskClick="false" ref="resultModal" type="center">
			<image :src="alertBg" mode="widthFix"></image>
			<text class="result">{{finalResult}}</text>
			<button class="one-more-time custom-button" type="default" @tap="onmoreRound">再来一次</button>
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from '../../components/uni-popup/uni-popup.vue'
	import { baseUrl } from '../../utils/api.js'
	export default {
		components: {
			uniPopup
		},
		data() {
			return {
				deg: 0,
				speed: 16,
				areaNumber: 11,
				rotating: false,
				awardIndex: 1,
				awards: ['喝一杯', 'PASS', '找人喝光', '干杯', '上家喝光', '任人宰割', '下家喝光', '喝一半', '喝两杯', '摸一下', '倒满'],
				result: [],
				innerAudioContext: null,
				finalResult: ''
			};
		},
		mounted() {
			this.init()
			this.innerAudioContext = uni.createInnerAudioContext();
			this.innerAudioContext.autoplay = false;
			this.innerAudioContext.src = `${baseUrl}luckyWheel.wav`
			this.innerAudioContext.onError((res) => {
				console.log(res.errMsg);
			});
		},
		methods: {
			showModal() {
				this.$refs.resultModal.open()
			},
			onmoreRound() {
				this.$refs.resultModal.close()
			},
			init() {
				let deg = this.singleAngle / 2
				this.awards.forEach((item, index) => {
					if(index === 0) {
						deg = this.singleAngle / 2
					} else {
						deg += this.singleAngle
					}
					this.result.push({
						text: item,
						deg: deg
					})
				})
			},
			begin() {
				if(this.rotating) return
				this.innerAudioContext.play()
				
				let awardsReverse = [...this.awards].reverse()
				let awardIndex = this.random(0, 10)
				this.finalResult = awardsReverse[awardIndex]
				let endAddAngle = (awardIndex - 1) * this.singleAngle + this.singleAngle / 2 + 360
				let rangeAngle = (Math.floor(Math.random() * 4) + 4) * 360

				this.rotating = true
				let cAngle
				this.deg = 0
				this.timer = setInterval(() => {
					if(this.deg < rangeAngle) {
						this.deg += this.speed
					} else {
						cAngle = (endAddAngle + rangeAngle - this.deg) / this.speed
						cAngle = cAngle > this.speed ? this.speed : cAngle < 1 ? 1 : cAngle
						this.deg += cAngle
						if(this.deg >= endAddAngle + rangeAngle) {
							this.deg = endAddAngle + rangeAngle
							clearInterval(this.timer)
							this.rotating = false
							console.log(this.finalResult);
							this.showModal()
						}
					}
				}, 1000 / 60)
			},
			random(min, max) {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}
		},
		computed: {
			singleAngle() {
				return 360 / this.areaNumber
			},
			alertBg() {
				return `${baseUrl}/alert.png`
			}
		}
	}
</script>

<style lang="scss">
	page {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		background: radial-gradient(ellipse, #5108b1, #1f0f53);
		background-image: url(https://hkb.weishuapay.com/static/bg.png);
		background-position: center;
		background-size: cover;
	}
	
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		
		.wheel {
			width: 660rpx;
			height: 660rpx;
			position: relative;
			
			.bg {
				width: 100%;
				height: 100%;
				position: absolute;
			}
			
			.pointer {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 250rpx;
				height: 250rpx;
			}
			
			.item-wrapper {
				position: absolute;
				width: 100%;
				height: 100%;
				left: 0;
				top: 0;
				
				.inner {
					width: 100%;
					height: 100%;
					left: 0;
					top: 0;
					position: relative;
					
					.item {
						position: absolute;
						left: 50%;
						top: 50%;
						box-sizing: border-box;
						padding-left: 120rpx;
						height: 48rpx;
						width: 280rpx;
						margin-top: -24rpx;
						transform-origin: 0 24rpx;
						text-align: center;
					}
				}
			}
		}
	}
	.result-modal {
		position: relative;
		
		.result {
			position: absolute;
			color: #F2573B;
			font-weight: bold;
			top: 55%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
		.one-more-time {
			position: absolute;
			left: 50%;
			top: 82%;
			transform: translate(-50%,-50%);
			width: 180rpx;
			height: 70rpx;
			border-radius: 50rpx;
			box-shadow: none;
			background: linear-gradient(to bottom, #ffe67d, #ffd22a);
			color: #F2573B;
			font-size: 14px;
			&::before {
				content: none;
			}
		}
	}
	
</style>
