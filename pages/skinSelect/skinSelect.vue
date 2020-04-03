<template>
	<view>
		<view class="skin-list-container">
			<view class="skin-item" v-for="(item, index) in skinList" :key="index">
				<view class="thumbnail">
					<image class="thumbnail-img" :src="item.thumbnail" mode="widthFix"></image>
				</view>
				<view class="desc">
					<text class="desc-text">{{item.skin_desc}}</text>
					<button 
						:class="[item.selected ? '' : 'unselected']"
						:disabled="item.selected" 
						@tap="setDefaultSkin(item.id)"
					class="status">{{item.selected ? "使用中" : "选择"}}</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		data() {
			return {
				
			};
		},
		methods: {
			setDefaultSkin(id) {
				for(let i=0; i<this.skinList.length; i++) {
					this.skinList[i].selected = false
					if(this.skinList[i].id === id) {
						this.skinList[i].selected = true
						this.$store.state.skinIndex = i
						uni.setStorage({
							key: 'SKIN_INDEX',
							data: i,
							success: () => {
								uni.navigateBack()
							}
						})
					}
				}
			}
		},
		computed: {
			...mapState(['skinList'])
		},
		mounted() {
			console.log(this.$store.state.skinList)
		}
	}
</script>

<style lang="scss">
	page {
		background-color: rgb(208, 119, 214);
	}
	.skin-list-container {
		display: flex;
		flex-wrap: wrap;
		
		.skin-item {
			width: 210rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			margin: 40rpx 20rpx;
			border-radius: 10rpx;
			background: #FFFFFF;
			overflow: hidden;
			
			.thumbnail {
				background: radial-gradient(#FFFFFF, #8985FF);
				padding: 20rpx;
				width: 100%;
				text-align: center;
				box-sizing: border-box;
				
				.thumbnail-img {
					width: 150rpx;
				}
			}
			
			.desc {
				text-align: center;
				padding-top: 20rpx;
				padding-bottom: 20rpx;
				
				.status {
					margin-top: 20rpx;
					font-size: 12px;
					width: 150rpx;
					
					&::after {
						content: none;
					}
					
					&.unselected {
						background-color: #4E8CF2;
						color: #FFFFFF;
					}
				}
			}
		}
	}
</style>
