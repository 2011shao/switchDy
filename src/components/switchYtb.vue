
<template>
  <div>
    <a-typography-text
      >抖音小助手
      <a-typography-text type="primary" @click="helpVoid">
        查看教程
      </a-typography-text>
    </a-typography-text>
    <a-spin :loading="bit_loading" style="width: 100%" class="m-t-10">
      <div class="grid-one p-all-1 grid-gap-5">
        <AuthView></AuthView>
        <a-divider>视频信息</a-divider>
        <SelectTableView
          title="抖音视频表"
          canAdd
          v-model="export_table_id"
          :allFieldDic="{ dy_user_table_id }"
          :preSetArr="['抖音视频表']"
        ></SelectTableView>
        <a-checkbox-group v-model="select_video_info_arr">
          <a-space :size="20" wrap>
            <a-checkbox
              v-for="(value, key) in dy_video_info_dic"
              :key="key"
              :value="key"
              >{{ value }}</a-checkbox
            >
          </a-space>
        </a-checkbox-group>
        <a-button
          :loading="buttonLoading"
          :disabled="!commitCan"
          type="primary"
          @click="exportVoid"
          >开始解析</a-button
        >
        <a-progress v-if="buttonLoading" :percent="progress" />
      </div>
    </a-spin>
  </div>
</template>

<script setup >
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { Message } from "@arco-design/web-vue";
import SelectField from "./superView/SelectField.vue";
import AuthView from "./superView/AuthView.vue";

import {
  dy_user_info_dic,
  bit_loading,
  bit_table,
  export_table_id,
  addBitRecord,
  comment_table_id,
  oneStepCreateVideoTable,
  allUserArr,
  getTableAllFieldFromId,
} from "./js/superBase";
import SelectTableView from "./superView/selectTable.vue";
import axios from "axios";
import dayjs from "dayjs";
const buttonLoading = ref(false);
const exportAllFieldArr=ref([])
const bit_import_dic = ref({
  origin_filed: "",
});
const dy_video_info_dic = ref({
  cover: "视频封面",
  item_id: "视频id",
  title: "视频标题",
  play_count: "播放数",
  digg_count: "点赞数",
  share_count: "分享数",
  forward_count: "转发数",
  download_count: "下载数",
  comment_count: "评论数",
  create_time: "视频创建时间",
  update_create_time: "数据同步时间",
  video_status: "视频状态",
  media_type: "媒体类型",
  is_top: "是否置顶",
  nickname: "昵称",
});

const select_video_info_arr = ref([]);
const progress = ref(0);
onMounted(() => {
  select_video_info_arr.value = Object.keys(dy_video_info_dic.value);
});

// 导出word
async function get_target_filed_id(selectArr, confDic, tableId) {
  let dic = {};
  for (let key of selectArr) {
    dic[key] = confDic[key];
    const fileId = await oneStepCreateVideoTable(confDic[key], tableId);
    dic[key] = fileId;
  }
  return dic;
}
async function exportVoid() {
  progress.value = 0;
  buttonLoading.value = true;
  bit_loading.value = true;
  let target_filed_dic = await get_target_filed_id(
    select_video_info_arr.value,
    dy_video_info_dic.value,
    export_table_id.value
  );

  let i = 0;
   exportAllFieldArr.value = await getTableAllFieldFromId(export_table_id.value);

  for (const userInfo of allUserArr.value) {
    i++;
    progress.value = (i / allUserArr.value.length).toFixed(2);
    const url =
      "https://4d2817de-abee-4c7e-8ded-de0807bdfdb4-00-164tnsiwbavws.sisko.replit.dev";
    // const url='http://170.106.194.62:5001'
    const resData = await axios
      .get(
        `${url}/videolist?open_id=${userInfo["open_id"]}&access_token=${userInfo["access_token"]}`
      )
    if (resData.data.errCode == 0) {
      // 视频信息
      const newDataArr = resultMapDic(
        resData.data.data.list,
        target_filed_dic,
        userInfo
      );

      await addBitRecord(newDataArr, export_table_id.value);
    }
  }
  Message.success("解析完成");
  buttonLoading.value = false;
  bit_loading.value = false;
}

// 视频信息
function resultMapDic(dataArr, target_filed_dic, userInfo) {
  let arr = [];
  for (let data of dataArr) {
    Object.assign(data, data["statistics"]);
    
    let dic = { fields: {} };
    for (let key in target_filed_dic) {
      if (key == "nickname") {
        dic["fields"][target_filed_dic[key]] = userInfo.nickname;
      } else if (key == "media_type") {
        if (data[key] == "2") {
          dic["fields"][target_filed_dic[key]] =getOptionId(target_filed_dic[key],"图集");
        }
        if (data[key] == "4") {
          dic["fields"][target_filed_dic[key]] =getOptionId(target_filed_dic[key],"视频");
        }
      } else if (key == "is_top") {
        if (data[key]) {
          dic["fields"][target_filed_dic[key]] =getOptionId(target_filed_dic[key],"是");
        }
        if (data[key] == "4") {
          dic["fields"][target_filed_dic[key]] = getOptionId(target_filed_dic[key],"否");
        }
      } else if (key == "video_status") {
        if (data[key] == 1) {
          dic["fields"][target_filed_dic[key]] =getOptionId(target_filed_dic[key], "已发布");
        }
        if (data[key] == "2") {
          dic["fields"][target_filed_dic[key]] =getOptionId(target_filed_dic[key],"不适宜公开");
        }
        if (data[key] == "4") {
          dic["fields"][target_filed_dic[key]] = getOptionId(target_filed_dic[key],"审核中");
        }
      } else {
        dic["fields"][target_filed_dic[key]] = data[key];
      }
    }
    for (let key in dic.fields) {
      if (key == "undefined") {
        delete dic.fields[key];
      }
    }
    arr.push(dic);
  }
  return arr;
}
function getOptionId(fieldId, name) {
  
  const czOption = exportAllFieldArr.value.find(
    (a) => a["id"] == fieldId && a["type"] == 3
  );
  if (czOption) {
    const czItem = czOption.property.options.find((a) => a["name"] == name);
    if (czItem) {
      console.log(name,czItem.id)
      return czItem.id;
    }
  }
  return "";
}
const commitCan = computed(() => {
  if (select_video_info_arr.value.length > 0 && export_table_id.value) {
    return true;
  }

  return false;
});
function helpVoid(params) {
  window.open(
    "https://y35xdslz6g.feishu.cn/docx/EhI1dCS2boR6nQxmu8fcXiBbnZf?from=from_copylink",
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
