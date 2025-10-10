import navBar from "../common/Navbar/navbar.vue"
import Phone from "@/components/uni-phone/index.vue"
import popMask from "./components/popMask.vue"
import popCart from "./components/popCart.vue"
import dishDetail from "./components/dishDetail.vue"
import {
	userLogin,
	getCategoryList,
	dishListByCategoryId,
	querySetmeaList,
	getShoppingCartList,
	newAddShoppingCartAdd,
	newShoppingCartSub,
	delShoppingCart,
	querySetmealDishById,
	getMerchantInfo,
	getGoodDetail
} from "../api/api.js"
import { mapState, mapMutations } from "vuex"
import { baseUrl } from "../../utils/env"

export default {
	data() {
		return {
			title: "Hello",
			openOrderCartList: false,
			typeListData: [],
			dishListData: [],
			dishListItems: [],
			dishDetailes: {},
			openDetailPop: false,
			openMoreNormPop: false,
			moreNormDataes: null,
			tableInfo: null,
			moreNormDishdata: null,
			moreNormdata: null,
			dishMealData: null,
			openTablePeoPleNumber: 1,
			orderData: 0,
			typeIndex: 0,
			openTablePop: false,
			flavorDataes: [],
			orderDishNumber: 0,
			orderDishPrice: 0,
			params: {
				shopId: "f3deb",
				storeId: "1282344676983062530",
				tableId: "1282346960773238786",
			},
			rightIdAndType: {},
			phoneData: "",
			tablewareNumber: 0,
			// 移除 shopStatus 相关数据
			scrollTop: 0,
			menuHeight: 0,
			menuItemHeight: 0,
			itemId: "",
			arr: [],
		}
	},

	components: {
		navBar,
		Phone,
		popMask,
		popCart,
		dishDetail,
	},

	computed: {
		orderListDataes: function () {
			return this.orderListData()
		},
		loaddingSt: function () {
			return this.lodding()
		},
		orderAndUserInfo: function () {
			let orderData = []
			Array.isArray(this.orderListDataes) &&
			this.orderListDataes.forEach((n, i) => {
				let userData = {}
				userData.nickName = n.name ?? ""
				userData.avatarUrl = n.image ?? ""
				userData.dishList = [n]
				const num = orderData.findIndex(
					(o) => o.nickName == userData.nickName
				)
				if (num != -1) {
					orderData[num].dishList.push(n)
				} else {
					orderData.push(userData)
				}
			})
			return orderData
		},
		ht: function () {
			return (
				uni.getMenuButtonBoundingClientRect().top +
				uni.getMenuButtonBoundingClientRect().height +
				7
			)
		},
	},

	onReady() {
		this.getMenuItemTop()
	},

	onLoad(options) {
		uni.onNetworkStatusChange(function (res) {
			if (res.isConnected == false) {
				uni.navigateTo({
					url: "/pages/nonet/index",
				})
			}
		})
		if (options) {
			if (!options.status && !options.formOrder) {
				this.getData()
			}
		}
	},

	onShow() {
		if (this.token()) {
			this.init()
		}
	},

	methods: {
		...mapMutations([
			"setShopInfo",
			"setShopPhone",
			"initdishListMut",
			"setStoreInfo",
			"setBaseUserInfo",
			"setLodding",
			"setToken",
			"setDeliveryFee",
		]),

		...mapState([
			"shopInfo",
			"shopPhone",
			"orderListData",
			"baseUserInfo",
			"lodding",
			"token",
			"deliveryFee",
		]),

		loginSync() {
			return new Promise((resolve, reject) => {
				uni.login({
					success: (loginRes) => {
						if (loginRes.errMsg === "login:ok") {
							resolve(loginRes.code)
						}
					},
				})
			})
		},

		getData() {
			let res = wx.getMenuButtonBoundingClientRect()
			let _this = this
			this.selectHeight = res.height

			if (this.token() === "") {
				uni.showModal({
					title: "温馨提示",
					content: "亲，授权微信登录后才能点餐！",
					showCancel: false,
					success(res) {
						if (res.confirm) {
							uni.getUserProfile({
								desc: "登录",
								success: function (userInfo) {
									_this.setBaseUserInfo(userInfo.userInfo)

									uni.login({
										provider: "weixin",
										success: (loginRes) => {
											console.log("获取到的登录凭证:", loginRes)
											if (loginRes.errMsg === "login:ok" && loginRes.code) {
												const params = {
													code: loginRes.code,
												}

												console.log("发送登录请求参数:", params)

												userLogin(params)
													.then((success) => {
														console.log("登录响应:", success)
														if (success.code === 1) {
															_this.setToken(success.data.token)
															_this.setDeliveryFee(success.data.deliveryFee)
															_this.setShopInfo({
																shopName: success.data.shopName,
																shopAddress: success.data.shopAddress,
																shopId: success.data.shopId,
															})
															_this.init()
														} else {
															uni.showToast({
																title: "登录失败，请重试",
																icon: "none"
															})
														}
													})
													.catch((err) => {
														console.error("登录请求失败:", err)
														uni.showToast({
															title: "网络错误，请重试",
															icon: "none"
														})
													})
											} else {
												console.error("获取微信登录凭证失败:", loginRes)
												uni.showToast({
													title: "获取登录凭证失败",
													icon: "none"
												})
											}
										},
										fail: function(err) {
											console.error("调用微信登录接口失败:", err)
											uni.showToast({
												title: "微信登录接口调用失败",
												icon: "none"
											})
										}
									})
								},
								fail: function (err) {
									console.error("用户拒绝授权:", err)
									uni.showToast({
										title: "需要授权才能登录",
										icon: "none"
									})
								},
							})
						}
					},
				})
			}
		},

		async init() {
			if (this.typeIndex !== 0) {
				this.typeIndex = 0
			}

			getCategoryList().then((res) => {
				if (res && res.code === 1) {
					this.typeListData = [...res.data]
					if (res.data.length > 0) {
						this.getDishListDataes(res.data[this.typeIndex || 0])
					}
				}
			})

			this.getTableOrderDishListes()
		},

        // 点击左边的栏目切换
		async swichMenu(params, index) {
			if (this.arr.length == 0) {
				await this.getMenuItemTop()
			}
			if (index == this.typeIndex) return
			this.$nextTick(function () {
				this.typeIndex = index
				this.leftMenuStatus(index)
			})
			this.getDishListDataes(params, index)
		},

		// 获取一个目标元素的高度
		getElRect(elClass, dataVal) {
			new Promise((resolve, reject) => {
				const query = uni.createSelectorQuery().in(this)
				query
					.select("." + elClass)
					.fields(
						{
							size: true,
						},
						(res) => {
							// 如果节点尚未生成，res值为null，循环调用执行
							if (!res) {
								setTimeout(() => {
									this.getElRect(elClass)
								}, 10)
								return
							}
							this[dataVal] = res.height
							resolve()
						}
					)
					.exec()
			})
		},
		// 设置左边菜单的滚动状态
		async leftMenuStatus(index) {
			this.typeIndex = index
			// 如果为0，意味着尚未初始化
			if (this.menuHeight == 0 || this.menuItemHeight == 0) {
				await this.getElRect("menu-scroll-view", "menuHeight")
				await this.getElRect("type_item", "menuItemHeight")
			}
			// 将菜单活动item垂直居中
			this.scrollTop =
				index * this.menuItemHeight +
				this.menuItemHeight / 2 -
				this.menuHeight / 2
		},
		// 获取右边菜单每个item到顶部的距离
		getMenuItemTop() {
			new Promise((resolve) => {
				let selectorQuery = uni.createSelectorQuery()
				selectorQuery
					.selectAll(".class-item")
					.boundingClientRect((rects) => {
						// 如果节点尚未生成，rects值为[](因为用selectAll，所以返回的是数组)，循环调用执行
						if (!rects.length) {
							setTimeout(() => {
								this.getMenuItemTop()
							}, 10)
							return
						}
					})
					.exec()
			})
		},
		/// 获取菜品列表
		async getDishListDataes(params, index) {
			this.rightIdAndType = {}
			this.rightIdAndType = {
				id: params.id,
				type: params.type,
			}
			const param = {
				categoryId: params.id,
			}

			// 统一使用新的接口获取商品列表，不再区分菜品和套餐
			await dishListByCategoryId(param)
				.then((res) => {
					if (res && res.code === 1) {
						// 添加一个字段去实时更新加入购物车number数量 ----- newCardNumber
						this.dishListData =
							res.data &&
							res.data.map((obj) => ({
								...obj,
								type: params.type, // 使用分类的类型
								newCardNumber: 0,
							}))
					}
				})
				.catch((err) => {
					console.error('获取商品列表失败:', err)
				})

			this.typeIndex = index
			this.setOrderNum()
		},

		// 获取店铺电话
		async getMerchantInfo() {
			await getMerchantInfo()
				.then((res) => {
					this.phoneData = res.data.phone
					console.log(res);
					this.setShopPhone(res.data)
				})
				.catch((err) => { })
		},
		// 重新拼装image
		getNewImage(image) {
			return `${baseUrl}/common/download?name=${image}`
		},
		// 获取购物车订单列表
		async getTableOrderDishListes() {
			// 调用获取购物车集合接口
			await getShoppingCartList({})
				.then((res) => {
					if (res.code === 1) {
						this.initdishListMut(res.data)
						this.computOrderInfo()
					}
				})
				.catch((err) => { })
		},
		// 去订单页面
		goOrder() {
			uni.navigateTo({
				url: "/pages/order/index",
			})
		},
		// 加菜 - 添加菜品
		async addDishAction(item, form) {
			// 规格检查...
			this.openMoreNormPop = false

			// 确保数据正确传递-
			let requestData = {
				goodId: item.id
			}

			console.log("准备发送的数据:", requestData);

			// 立即发送，避免数据被修改
			newAddShoppingCartAdd(requestData)
				.then((res) => {
					if (res.code === 1) {
						// 显示添加成功提示
						uni.showToast({
							title: '添加成功',
							icon: 'success',
							duration: 1000
						});


						// 更新购物车数据
						this.getTableOrderDishListes();
						this.getDishListDataes(this.rightIdAndType);
						this.flavorDataes = [];

						// 更新详情界面的数量显示
						if (this.dishDetailes.id === item.id) {
							this.dishDetailes.dishNumber = (this.dishDetailes.dishNumber || 0) + 1;
						}
					} else {
						uni.showToast({
							title: res.msg || '添加失败',
							icon: 'none'
						});
					}
				})
				.catch((err) => {
					console.error("添加购物车失败:", err);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				})
		},
		// 加入购物车
		addShop(item) {
			console.log(item);
			this.dishDetailes = item
			this.addDishAction(item, "普通")
		},
		// 减菜 - 添加菜品
		async redDishAction(item, form) {
			// 实时更新obj.newCardNumber新添加的字段----加入购物车数量number
			this.tablewareNumber--
			this.dishDetailes.dishNumber--

			// 构建参数 - 只传递 goodId，移除其他字段
			let params = {
				goodId: item.id  // 只传递 goodId
			}

			console.log("减少购物车参数:", params); // 调试日志

			await newShoppingCartSub(params)
				.then((res) => {
					if (res.code === 1) {
						// 调用一次购物车集合---初始化
						this.getTableOrderDishListes()
						// 重新调取刷新右侧具体菜品列表
						this.getDishListDataes(this.rightIdAndType)
					}
				})
				.catch((err) => {
					console.error("减少购物车失败:", err);
				})
		},
		// 清空购物车
		clearCardOrder() {
			delShoppingCart()
				.then((res) => {
					this.openOrderCartList = false
					// 调用一次购物车集合---初始化
					this.getTableOrderDishListes()
					// 重新调取刷新右侧具体菜品列表
					this.getDishListDataes(this.rightIdAndType)
				})
				.catch((err) => { })
		},
		// 打开商品详情 - 修复价格显示问题
		async openDetailHandle(item) {
			try {
				console.log('打开商品详情，商品信息:', item);
				this.setLodding(true);

				let detailData = null;

				// 直接使用商品列表数据，确保价格字段存在
				detailData = {
					...item,
					type: 1,
					dishNumber: item.dishNumber || 0,
					// 确保价格字段存在
					price: item.price || 0,
					description: item.description || `${item.name} - 蜂享自然优质蜂蜜产品`,
					flavors: item.flavors || [],
					// 添加商品规格信息
					specifications: [
						{ name: '净含量', value: '500g' },
						{ name: '产地', value: '深山蜂场' },
						{ name: '保质期', value: '24个月' }
					]
				};

				this.dishDetailes = detailData;
				this.openDetailPop = true;
				console.log('商品详情数据:', detailData);

			} catch (error) {
				console.error('打开详情失败:', error);
				uni.showToast({
					title: '打开详情失败',
					icon: 'none'
				});
			} finally {
				this.setLodding(false);
			}
		},

		// 从商品项构建详情数据
		buildDetailDataFromItem(item) {
			return {
				...item,
				type: 1,
				dishNumber: item.dishNumber || 0,
				description: item.description || `${item.name} - 蜂享自然优质蜂蜜产品`,
				flavors: item.flavors || [],
				// 添加商品规格信息
				specifications: [
					{ name: '净含量', value: '500g' },
					{ name: '产地', value: '深山蜂场' },
					{ name: '保质期', value: '24个月' }
				]
			};
		},
		// 关闭菜品详情
		dishClose() {
			this.openDetailPop = false
		},
		// 多规格数据处理
		moreNormDataesHandle(item) {
			this.flavorDataes.splice(0)
			this.moreNormDishdata = item
			this.openDetailPop = false
			this.openMoreNormPop = true
			this.moreNormdata = item.flavors.map((obj) => ({
				...obj,
				value: JSON.parse(obj.value),
			}))
			this.moreNormdata.forEach((item) => {
				if (item.value && item.value.length > 0) {
					this.flavorDataes.push(item.value[0])
				}
			})
		},
		// 选规格 处理一行只能选择一种
		checkMoreNormPop(val) {
			let obj = val.obj
			let item = val.item
			let ind
			let findst = obj.some((n) => {
				ind = this.flavorDataes.findIndex((o) => o == n)
				return ind != -1
			})
			const num = this.flavorDataes.findIndex((it) => it == item)
			if (num == -1 && !findst) {
				this.flavorDataes.push(item)
			} else if (findst) {
				this.flavorDataes.splice(ind, 1)
				this.flavorDataes.push(item)
			} else {
				this.flavorDataes.splice(num, 1)
			}
		},
		// 关闭选规格弹窗
		closeMoreNorm(moreNormDishdata) {
			this.flavorDataes.splice(0, this.flavorDataes.length)
			this.openMoreNormPop = false
		},
		// 订单里和总订单价格计算
		computOrderInfo() {
			let oriData = this.orderListDataes
			this.orderDishNumber = this.orderDishPrice = 0
			oriData.map((n, i) => {
				this.orderDishNumber += n.number
				this.orderDishPrice += n.number * n.amount
			})
			this.orderDishPrice = this.orderDishPrice
		},
		// 处理点餐数量 - 更新菜品已点餐数量
		setOrderNum() {
			let ODate = this.dishListData
			let CData = this.orderListDataes
			ODate &&
				ODate.map((obj, index) => {
					obj.dishNumber = 0
					// 去除空的规格
					if (obj.flavors) {
						obj.flavors.forEach((value, i) => {
							if (value.name === "") {
								obj.flavors.splice(i, 1)
							}
						})
					}

					if (CData.length > 0) {
						CData &&
							CData.forEach((tg, ind) => {
								if (obj.id === tg.dishId) {
									obj.dishNumber = tg.number
								}
								if (obj.id === tg.setmealId) {
									obj.dishNumber = tg.number
								}
							})
					}
				})
			if (this.dishListItems.length == 0) {
				this.dishListItems = ODate
			} else {
				this.dishListItems.splice(0, this.dishListItems.length, ...ODate)
			}
		},
		// 拨打电话弹层
		handlePhone(type) {
			this.$refs.phone.$refs.popup.open(type)
		},
		// 关闭电话弹层
		closePopup(type) {
			this.$refs.phone.$refs.popup.close(type)
		},
		disabledScroll() {
			return false
		},
	},
}
