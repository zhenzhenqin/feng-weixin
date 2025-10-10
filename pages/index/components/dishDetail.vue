<!-- 商品详情弹层 -->
<template>
  <view>
    <view class="dish_detail_pop">
      <!-- 商品图片 -->
      <view class="image_container">
        <image
            mode="aspectFill"
            class="div_big_image"
            :src="dishDetailes.image"
        ></image>
      </view>

      <!-- 商品基本信息 -->
      <view class="product_basic_info">
        <view class="title">{{ dishDetailes.name }}</view>
        <view class="desc">{{ dishDetailes.description }}</view>
      </view>

      <!-- 底部操作栏 -->
      <view class="but_item">
        <view class="price_section">
          <view class="price">
            <text class="ico">￥</text>
            {{ dishDetailes.price ? dishDetailes.price.toFixed(2) : '0.00' }}
          </view>
        </view>

        <view class="cart_controls">
          <view
              class="active"
              v-if="dishDetailes.dishNumber > 0"
          >
          </view>

          <view
              class="active"
              v-else
          >
            <view class="dish_card_add" @click="addDishAndClose(dishDetailes, '普通')">
              加入购物车
            </view>
          </view>
        </view>
      </view>

      <!-- 右下角固定加入购物车按钮 -->
      <view class="fixed_add_cart" @click="handleAddToCart">
        <view class="cart_icon_wrapper">
          <view class="cart_badge" v-if="dishDetailes.dishNumber > 0">{{ dishDetailes.dishNumber }}</view>
        </view>
        <text class="fixed_cart_text">加入购物车</text>
      </view>
    </view>

    <!-- 关闭按钮 - 放置在详情界面下方 -->
    <view class="close" @click="dishClose">
      <image
          class="close_img"
          src="../../../static/but_close.png"
          mode=""
      ></image>
    </view>
  </view>
</template>



<script>
export default {
  // 获取父级传的数据
  props: {
    dishDetailes: {
      type: Object,
      default: () => ({}),
    },
    openDetailPop: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    // 加入购物车并关闭详情
    addDishAndClose(obj, item) {
      console.log("加入购物车并关闭详情:", obj, item);
      this.$emit("addDishAction", obj, item);
      // 延迟关闭，确保父组件先处理加入购物车逻辑
      setTimeout(() => {
        this.dishClose();
      }, 300);
    },
    // 新增的添加购物车方法
    handleAddToCart() {
      console.log("添加商品到购物车:", this.dishDetailes);
      this.$emit("addDishAction", this.dishDetailes, "普通");
      // 添加完成后关闭界面
      setTimeout(() => {
        this.dishClose();
      }, 50);
    },
    redDishAction(obj, item) {
      this.$emit("redDishAction", obj, item);
    },
    // 关闭菜单详情
    dishClose() {
      this.$emit("dishClose");
    },
  },
};
</script>


<style lang="scss" scoped>
.dish_detail_pop {
  width: calc(100vw - 80rpx);
  max-width: 600rpx;
  box-sizing: border-box;
  position: fixed;
  top: 50%;
  left: 50%;
  padding: 40rpx;
  transform: translateX(-50%) translateY(-50%);
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;
  z-index: 10000;

  .image_container {
    position: relative;
    margin-bottom: 30rpx;

    .div_big_image {
      width: 100%;
      height: 400rpx;
      border-radius: 15rpx;
    }
  }

  .product_basic_info {
    margin-bottom: 40rpx;

    .title {
      font-size: 36rpx;
      line-height: 50rpx;
      text-align: center;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }

    .desc {
      font-size: 28rpx;
      line-height: 40rpx;
      color: #666;
      text-align: center;
      padding: 0 20rpx;
    }
  }

  /* 商品规格样式 */
  .specs_section {
    margin: 30rpx 0;
    padding: 25rpx;
    background: #f8f8f8;
    border-radius: 15rpx;

    .section_title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }

    .specs_list {
      .spec_item {
        display: flex;
        margin-bottom: 15rpx;
        font-size: 26rpx;
        padding: 12rpx 0;
        border-bottom: 1rpx dashed #e0e0e0;

        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .spec_label {
          color: #666;
          width: 140rpx;
          font-weight: 500;
        }

        .spec_value {
          color: #333;
          flex: 1;
        }
      }
    }
  }

  /* 底部操作栏 */
  .but_item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 40rpx;
    padding-top: 30rpx;
    border-top: 1rpx solid #f0f0f0;

    .price_section {
      .price {
        text-align: left;
        color: #e94e3c;
        line-height: 1;
        font-size: 42rpx;
        font-weight: bold;

        .ico {
          font-size: 26rpx;
        }
      }
    }

    .cart_controls {
      .active {
        display: flex;
        align-items: center;

        .dish_add,
        .dish_red {
          display: block;
          width: 60rpx;
          height: 60rpx;
        }

        .dish_number {
          padding: 0 15rpx;
          line-height: 60rpx;
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
          min-width: 40rpx;
          text-align: center;
        }

        .dish_card_add {
          width: 180rpx;
          line-height: 65rpx;
          text-align: center;
          font-weight: 500;
          font-size: 26rpx;
          background: #ffc200;
          border-radius: 32rpx;
          color: #333;
        }
      }
    }
  }

  /* 右下角固定加入购物车按钮 */
  .fixed_add_cart {
    position: fixed;
    right: 30rpx;
    bottom: 30rpx;
    display: flex;
    align-items: center;
    background: #ffc200;
    padding: 16rpx 25rpx;
    border-radius: 40rpx;
    box-shadow: 0 4rpx 15rpx rgba(255, 194, 0, 0.3);
    z-index: 1000;

    .cart_icon_wrapper {
      position: relative;
      margin-right: 12rpx;

      .fixed_cart_icon {
        width: 36rpx;
        height: 36rpx;
      }

      .cart_badge {
        position: absolute;
        top: -6rpx;
        right: -6rpx;
        background: #e94e3c;
        color: #fff;
        font-size: 18rpx;
        width: 30rpx;
        height: 30rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2rpx solid #fff;
      }
    }

    .fixed_cart_text {
      font-size: 26rpx;
      font-weight: 500;
      color: #333;
    }
  }
}

/* 关闭按钮 - 放置在详情界面下方 */
.close {
  position: fixed;
  top: calc(50% + 300px); /* 定位在弹窗下方 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;

  .close_img {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.15);
  }
}

/* 滚动条样式优化 */
.dish_detail_pop::-webkit-scrollbar {
  width: 4rpx;
}

.dish_detail_pop::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2rpx;
}

.dish_detail_pop::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2rpx;
}
</style>
