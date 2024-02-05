
<template>
  <div>
    <a-typography-text
      >抖音助手
      <a-typography-text type="primary" @click="helpVoid">
        查看教程
      </a-typography-text>
    </a-typography-text>
    <AuthVideoList></AuthVideoList>

    <!-- <a-tabs>
      <a-tab-pane title="视频数据" key="1">
        <AuthVideoList></AuthVideoList>
      </a-tab-pane>
      <a-tab-pane title="粉丝画像数据" key="2">
        <AuthVideoList></AuthVideoList>
      </a-tab-pane>
      <a-tab-pane title="直播数据" key="3">
        <AuthVideoList></AuthVideoList>
      </a-tab-pane>
      <a-tab-pane title="热点视频数据" key="4">
        <AuthVideoList></AuthVideoList>
      </a-tab-pane>
    </a-tabs> -->
  </div>
</template>

<script setup >
import { ref } from "vue";
import AuthVideoList from "../components/apicomponents/AuthVideoList.vue";
function helpVoid(params) {
  window.open(
    "https://y35xdslz6g.feishu.cn/docx/IVL9ddX0bozcPGxtjzwcMtXvnSb?from=from_copylink",
    "_blank"
  );
}
</script>
<style>
.labelCss {
  width: 70px;
  text-align: center;
  flex-shrink: 0;
}
</style>
