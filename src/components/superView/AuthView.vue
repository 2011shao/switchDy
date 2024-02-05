
<template>
  <div class="grid-one">
    <a-divider>已授权抖音账号</a-divider>
    <div class="row-center-center" v-if="!dy_user_table_id">
      <a-button status="success" @click="oneStepCreateAuthUserTable"
        >请先创建抖音用户表</a-button
      >
    </div>
    <div class="row-between-center" v-else>
      <a-typography-text>抖音用户表</a-typography-text>
      <a-button @click="getDyUserList" type="primary">刷新</a-button>
    </div>
    <a-space class="" wrap v-if="dy_user_table_id">
      <div class="column-center-center" @click="webAuth">
        <a-avatar
          :size="44"
          shape="square"
          :style="{ backgroundColor: '#000' }"
        >
          <!-- <icon-tiktok-color /> -->
          <img src="/src/assets/dy.png" />
        </a-avatar>
        <a-typography-text>点击授权</a-typography-text>
      </div>
      <div
        class="column-center-center"
        v-for="(item, index) in allUserArr"
        :key="index"
      >
        <a-avatar :size="44" shape="square">
          <img alt="avatar" :src="item.avatar" />
        </a-avatar>
        <a-typography-text>{{ item.nickname }}</a-typography-text>
      </div>
    </a-space>
  </div>
</template>

<script setup>
import { Message } from "@arco-design/web-vue";
import axios from "axios";
import dayjs from "dayjs";
import { ref, onMounted } from "vue";

import {
  dy_user_table_id,
  dy_user_info_dic,
  oneStepCreateAuthUserTable,
  getDyUserList,
  addBitRecord,
  allUserArr,
} from "../js/superBase";

onMounted(() => {
  const state = getUrlDataWithName("state");
  if (state) {
    const backDic = getDyCode(state);
    const code = getUrlDataWithName("code");
    getUserInfo(code, backDic);
  }
});

async function test() {
  const newDataArr = resultMapDic(
    { open_id: "open_id", access_token: "access_token" },
    dy_user_info_dic.value
  );
  await addBitRecord(newDataArr, dy_user_table_id.value);
}

function getUserInfo(code, dic) {
  const url =
    "https://3afd9d97-3bbf-4feb-bbe5-c84c209c9954-00-272avr8nhhznn.pike.replit.dev";
  axios.get(`${url}/dyauth?code=${code}`).then(async (res) => {
    if (res.data.errCode == 0) {
      const newDataArr = resultMapDic(res.data.data, dy_user_info_dic.value);
      await addBitRecord(newDataArr, dy_user_table_id.value);
      getDyUserList();
    }
  });
}

function webAuth() {
  if (!dy_user_table_id.value) {
    return Message.info("请先创建抖音用户表");
  }
  const canScope = "user_info,video.list.bind";
  let state = base64UrlEncode(encodeURIComponent(`{"back":"1"}`)); // encode后拼接到授权链接上
  window.location.href = `https://open.douyin.com/platform/oauth/connect/?client_key=awl98juj5xz2ruu9&response_type=code&state=${state}&scope=${canScope}&redirect_uri=https://switch-dy.replit.app/`;
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

// 视频信息
function resultMapDic(data, target_filed_dic) {
  let dic = { fields: {} };
  for (let key in target_filed_dic) {
    if (key == "end_time") {
      dic["fields"][target_filed_dic[key]] = dayjs().add(14, "day").valueOf();
    } else {
      dic["fields"][target_filed_dic[key]] = data[key];
    }
  }
  for (let key in dic.fields) {
    if (key == "undefined") {
      delete dic.fields[key];
    }
  }
  return dic;
}

// async function getAllAuthUserList(){
//   const bit_selection = await bitable.base.getSelection()
//   baseIdkey.value = bit_selection.baseId
//   axios.get('')
// }
</script>

<style>
</style>
