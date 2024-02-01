
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
        <a-divider>视频信息</a-divider>
        <SelectTableView
          title="视频信息表"
          canAdd
          v-model="export_table_id"
          :allFieldDic="{ comment_table_id, import_table_id }"
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
import {
  bit_loading,
  bit_table,
  export_table_id,
  import_table_id,
  addBitRecord,
  comment_table_id,
  oneStepCreateManConfig
} from "./js/superBase";
import SelectTableView from "./superView/selectTable.vue";
import axios from "axios";
import dayjs from "dayjs";
const buttonLoading = ref(false);
const bit_import_dic = ref({
  origin_filed: "",
});
const dy_video_info_dic = ref({
  cover: "视频封面",
  item_id: "视频封面",
  title: "视频标题",
  play_count: "播放量",
  digg_count: "点赞数",
  share_count: "分享数",
  forward_count: "分享数",
  forward_count: "收藏数",
  download_count: "下载数",
  comment_count: "评论数",
  create_time: "视频创建时间",
  update_create_time: "数据同步时间",
  video_status: "视频状态",
  media_type: "媒体类型",
  is_top: "是否置顶",
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
    const fileId = await oneStepCreateManConfig(confDic[key], tableId);
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
  debugger
  let newDataArr = [];
  let i = 0;
  for (const userInfo of recordIdList) {
    i++;
    progress.value = (i / recordIdList.length).toFixed(2);
    const resData = await axios
      .get(`https://fsgoole.replit.app/?open_id=${userInfo["open_id"]}`)
      .catch((err) => {
        i++;
        progress.value = (i / recordIdList.length).toFixed(2);
      });
    if (resData.data.errCode == 0) {
      // 视频信息
      const dic = resultMapDic(resData.data.data, target_filed_dic);
      newDataArr.push(dic);
    }
  }

  await addBitRecord(newDataArr, export_table_id.value);

  newDataArr = [];

  Message.success("解析完成");
  buttonLoading.value = false;
  bit_loading.value = false;
}

// 视频信息
function resultMapDic(data, target_filed_dic) {
  let dic = { fields: {} };
  for (let key in target_filed_dic.value) {
    dic["fields"][target_filed_dic[key]] = data[key];
  }
  for (let key in dic.fields) {
    if (key == "undefined") {
      delete dic.fields[key];
    }
  }
  return dic;
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
