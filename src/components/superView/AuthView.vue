
<template>
  <div class="">
    <a-button type="primary" @click="webAuth">授权</a-button>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
onMounted(() => {
  const state = getUrlDataWithName("state");
  if (state) {
    const backDic = getDyCode(state);
    console.log("返回值", backDic);
  }
});

function webAuth() {
  const canScope = "user_info,h5.share,fans.check,open.get.ticket";
  let state = base64UrlEncode(encodeURIComponent('{"id":1,"back":"测试"}')); // encode后拼接到授权链接上
  window.location.href = `${window.location.href}?state=${state}`;
  // window.location.href = `https://open.douyin.com/platform/oauth/connect/?client_key=awl98juj5xz2ruu9&response_type=code&state=${state}&scope=${canScope}&redirect_uri=${window.location.href}`;
}

function getDyCode(state) {
  return decodeURIComponent(base64UrlDecode(state)); // 用户授权完成后重定向到开发者页面，decode处理
}
function getUrlDataWithName(name) {
  var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i"),
    url = window.location;

  if (reg.test(url)) {
    return unescape(RegExp.$2.replace(/\+/g, " "));
  }
  return "";
}

function base64UrlEncode(str) {
  let base64 = btoa(str);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/"); // 将 URL 安全的字符替换为 Base64 字符
  while (str.length % 4) {
    str += "=";
  }
  return atob(str); // 解码 Base64 字符串
}
</script>

<style>
</style>
