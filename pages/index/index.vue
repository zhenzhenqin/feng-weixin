<template>
  <view>
    <!-- 导航 -->
    <navBar></navBar>
    <!-- end -->
    <view class="home_content" :style="{ paddingTop: ht + 'px' }"
          @touchmove.stop.prevent="disabledScroll">
      <!-- 店铺基本信息 -->
      <view class="restaurant_info_box">
        <view class="restaurant_info">
          <!-- 上部 -->
          <view class="info_top">
            <view class="info_top_left">
              <image class="logo_ruiji"
                     src="../../static/logo_fengxiang.png"></image>
            </view>
            <view class="info_top_right">
              <view class="right_title">
                <text>蜂享自然</text>
                <view class="honey-badge">🍯 纯正蜂蜜</view>
              </view>
              <view class="right_details">
                <view class="details_flex">
                  <view class="feature-tag">天然无添加</view>
                  <view class="feature-tag">源头直采</view>
                  <view class="feature-tag">农家自产</view>
                </view>
              </view>
            </view>
          </view>
          <!-- 下部---信息简介 -->
          <view class="info_bottom">
            <view>
              <view class="word">蜂享自然为您提供纯天然优质蜂蜜产品</view>
              <view class="address">
                <icon class="honey-icon">🐝</icon>
                {{ shopInfo().shopAddress || "商家店铺获取中.." }}
              </view>
            </view>
            <view>
              <view class="phone" @click="handlePhone('bottom')">
                <icon class="phoneIcon">📞</icon>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- end -->

      <!-- 菜单列表 -->
      <!-- 移除店铺状态判断，始终显示菜单 -->
      <view class="restaurant_menu_list">
        <view class="type_list">
          <scroll-view scroll-y scroll-with-animation class="u-tab-view
menu-scroll-view" :scroll-top="scrollTop + 100"
                       :scroll-into-view="itemId">
            <view class="type_item" id="target" :class="[typeIndex == index ?
'active' : '']"
                  v-for="(item, index) in typeListData" :key="index"
                  @tap.stop="swichMenu(item, index)">
              <view class="item" :class="item.name.length > 5 ? 'allLine' :
''">{{ item.name }}
              </view>
            </view>
            <view class="seize_seat"></view>
          </scroll-view>
        </view>
        <scroll-view class="vegetable_order_list" scroll-y="true"
                     scroll-top="0rpx"
                     v-if="dishListItems && dishListItems.length > 0">
          <view class="type_item" v-for="(item, index) in dishListItems"
                :key="index">
            <!-- 点击查看详情 -->
            <view class="dish_img" @click="openDetailHandle(item)">
              <image mode="aspectFill" :src="item.image"
                     class="dish_img_url"></image>
              <view class="honey-flag" v-if="item.isFeatured">🌟 推荐</view>
            </view>
            <view class="dish_info">
              <view class="dish_name" @click="openDetailHandle(item)">{{
                  item.name
                }}
              </view>
              <view class="dish_label" @click="openDetailHandle(item)">{{
                  item.description || item.name
                }}
              </view>
              <view class="dish_sales">
                <text class="sales-icon">📈</text>
                月销量{{ item.sales || 0 }}
              </view>
              <view class="dish_price">
                <text class="ico">￥</text>
                {{ item.price.toFixed(2) }}
              </view>
              <view class="dish_active" v-if="!item.flavors ||
item.flavors.length === 0">
                <!-- 减菜 -->
                <image v-if="item.dishNumber >= 1" src="../../static/btn_red.png"
                       @click="redDishAction(item, '普通')"
                       class="dish_red"></image>
                <text v-if="item.dishNumber > 0" class="dish_number">{{
                    item.dishNumber
                  }}
                </text>
                <!-- 加菜 -->
                <image src="../../static/btn_add.png" class="dish_add"
                       @click="addDishAction(item, '普通')"></image>
              </view>
              <view class="dish_active_btn" v-else>
                <view class="check_but"
                      @click="moreNormDataesHandle(item)">选择规格
                </view>
              </view>
            </view>
          </view>
          <view class="seize_seat"></view>
        </scroll-view>
        <view class="no_dish" v-else>
          <view v-if="typeListData.length > 0" class="no-product">
            <text class="no-product-icon">🍯</text>
            该分类下暂无商品
          </view>
        </view>
      </view>
      <!-- end -->

      <view class="mask-box"></view>

      <!-- 底部去结算 -->
      <!-- 购物车里没有订单的状态 -->
      <view class="footer_order_buttom" v-if="orderListData().length ===
0">
        <view class="order_number">
          <image src="../../static/btn_waiter_nor.png"
                 class="order_number_icon" mode=""></image>
        </view>
        <view class="order_price">
          <text class="ico">￥</text>
          0
        </view>
        <view class="order_but">去结算</view>
      </view>
      <!-- end -->

      <!-- 购物车里有订单结算 -->
      <view class="footer_order_buttom order_form" v-else>
        <view class="orderCar" @click="() => (openOrderCartList =
!openOrderCartList)">
          <view class="order_number">
            <image src="../../static/btn_waiter_sel.png"
                   class="order_number_icon" mode=""></image>
            <view class="order_dish_num">{{ orderDishNumber }}</view>
          </view>
          <view class="order_price">
            <text class="ico">￥</text>
            {{ orderDishPrice.toFixed(2) }}
          </view>
        </view>
        <view class="order_but" @click="goOrder()">去结算</view>
      </view>
      <!-- end -->

      <!-- 其他弹层组件保持不变 -->
      <view class="pop_mask" v-show="openMoreNormPop">
        <popMask :moreNormDishdata="moreNormDishdata"
                 :moreNormdata="moreNormdata" :flavorDataes="flavorDataes"
                 @checkMoreNormPop="checkMoreNormPop" @addShop="addShop"
                 @closeMoreNorm="closeMoreNorm"></popMask>
      </view>

      <view class="pop_mask" v-show="openDetailPop" style="z-index:
9999">
        <dishDetail :dishDetailes="dishDetailes"
                    :openDetailPop="openDetailPop" :dishMealData="dishMealData"
                    @redDishAction="redDishAction" @addDishAction="addDishAction"
                    @moreNormDataesHandle="moreNormDataesHandle"
                    @dishClose="dishClose"></dishDetail>
      </view>

      <view class="pop_mask" v-show="openOrderCartList"
            @click="openOrderCartList = !openOrderCartList">
        <popCart :openOrderCartLis="openOrderCartList"
                 :orderAndUserInfo="orderAndUserInfo"
                 @clearCardOrder="clearCardOrder" @addDishAction="addDishAction"
                 @redDishAction="redDishAction"></popCart>
      </view>

      <view class="pop_mask" v-show="loaddingSt">
        <view class="lodding">
          <image class="lodding_ico" src="../../static/lodding.gif"
                 mode=""></image>
        </view>
      </view>

      <!-- 电话弹层 -->
      <phone ref="phone" :phoneData="phoneData"
             @closePopup="closePopup"></phone>
      <!-- end -->
    </view>
  </view>
</template>

<script src="./index.js"></script>
<style src="./style.scss" lang="scss" scoped></style>
<style scoped>
/* #ifdef MP-WEIXIN || APP-PLUS */
::v-deep ::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
  color: transparent;
}

/* #endif */
</style>