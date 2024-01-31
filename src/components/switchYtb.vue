
<template>
  <div>
    <a-typography-text>{{$t('app_name')}}👉
      <a-typography-text type="primary" @click="helpVoid">
        {{$t('look_hepler') }}
      </a-typography-text>
    </a-typography-text>
    <a-spin :loading="bit_loading" style="width: 100%" class="m-t-10">
      <div class="grid-one p-all-1 grid-gap-5">
        <a-divider>{{$t('video_url') }}</a-divider>
        <SelectField :title="$t('video_url')" v-model="bit_import_dic.origin_filed" :typeNumArr="[1, 15]" :preSetArr="['视频地址', '地址', '链接']" :allFieldDic="bit_import_dic"></SelectField>
        <a-divider>{{$t('video_info') }}</a-divider>
        <SelectTableView :title="$t('video_table')" canAdd v-model="export_table_id" :allFieldDic="{ comment_table_id, import_table_id }"></SelectTableView>
        <a-checkbox-group v-model="select_video_info_arr">
          <a-space :size="20" wrap>
            <a-checkbox v-for="(value, key) in ytb_video_info_dic" :key="key" :value="key">{{ value }}</a-checkbox>
          </a-space>
        </a-checkbox-group>
        <a-divider>{{$t('video_pl') }}</a-divider>
        <div class="row-start-center">
          <a-typography-text class="flex-shrink labelCss">
            {{$t('video_pl') }}
          </a-typography-text>
          <a-radio-group v-model="is_comment">
            <a-radio :value="true">{{$t('must') }}</a-radio>
            <a-radio :value="false">{{$t('no_must') }}</a-radio>
          </a-radio-group>
        </div>
        <SelectTableView v-if="is_comment" :title="$t('pl_table')" canAdd v-model="comment_table_id" :allFieldDic="{ export_table_id, import_table_id }"></SelectTableView>
        <a-checkbox-group v-if="is_comment" v-model="select_video_comment_arr">
          <a-space :size="20" wrap>
            <a-checkbox v-for="(value, key) in ytb_video_comment_dic" :key="key" :value="key">{{ value }}</a-checkbox>
          </a-space>
        </a-checkbox-group>
        <a-button :loading="buttonLoading" :disabled="commitCan" type="primary" @click="exportVoid">{{$t('start_parse') }}</a-button>
        <a-progress v-if="buttonLoading" :percent="progress" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import {
    ref,
    onMounted,
    computed,
    watch,
    onUnmounted
  } from "vue";
  import {
    Message
  } from "@arco-design/web-vue";
  import SelectField from "./superView/SelectField.vue";
  import {
    bit_loading,
    bit_table,
    addBitNewField,
    export_table_id,
    import_table_id,
    addBitRecord,
    comment_table_id,
  } from "./js/superBase";
  import SelectTableView from "./superView/selectTable.vue";
  import {
    useI18n
  } from "vue-i18n";
  import axios from "axios";
  import dayjs from "dayjs";
  const buttonLoading = ref(false);
  const is_comment = ref(false);
  const {
    t,
    locale
  } = useI18n();
  const bit_import_dic = ref({
    origin_filed: "",
  });
  const ytb_video_info_dic = ref({});
  const select_video_info_arr = ref([]);
  const progress = ref(0);
  const select_video_comment_arr = ref([]);
  const ytb_video_comment_dic = ref({});
  onMounted(() => {
    changeLan()
    select_video_info_arr.value = Object.keys(ytb_video_info_dic.value);
    select_video_comment_arr.value = Object.keys(ytb_video_comment_dic.value);
  });
  function changeLan() {
    ytb_video_info_dic.value = {
      video_slt: t('video_slt'),
      video_title: t('video_title'),
      video_play_num: t('play_num'),
      video_zan_num: t('like_num'),
      video_pl_num: t('pl_num'),
      video_like_num: t('sc_num'),
      video_description: t('video_desc'),
      video_channelTitle: t('channel_title'),
      video_push_time: t('push_time')
    }
    ytb_video_comment_dic.value = {
      date: t('pl_time'),
      content: t('pl_content'),
      sender: t('pl_man'),
    }
  }
  watch(locale, (newLocale, oldLocale) => {
    changeLan()
  });
  // 导出word
  async function get_target_filed_id(selectArr, confDic, tableId) {
    let dic = {};
    for (let key of selectArr) {
      dic[key] = confDic[key];
      const fileId = await addBitNewField(confDic[key], tableId);
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
      ytb_video_info_dic.value,
      export_table_id.value
    );
    if (export_table_id.value != import_table_id.value) {
      const fileId = await addBitNewField(t('video_url'), export_table_id.value);
      target_filed_dic["video_url"] = fileId;
    }
    let target_comment_filed_dic = {};
    if (is_comment.value) {
      const fileId = await addBitNewField(t('video_url'), comment_table_id.value);
      target_comment_filed_dic = await get_target_filed_id(
        select_video_comment_arr.value,
        ytb_video_comment_dic.value,
        comment_table_id.value
      );
      target_comment_filed_dic["video_url"] = fileId;
    }
    // const recordList = await bit_table.getRecordList();
    const view = await bit_table.getActiveView();
    const recordIdList = await view.getVisibleRecordIdList();
    let newDataArr = [];
    let i = 0;
    for (const recordId of recordIdList) {
      const value = await bit_table.getCellValue(
        bit_import_dic.value.origin_filed,
        recordId
      );
      // const cell = await record.getCellByField(bit_import_dic.value.origin_filed);
      // const value = cell.val;
      if (!value) {
        i++;
        progress.value = (i / recordIdList.length).toFixed(2);
        continue;
      }
      if (Array.isArray(value) && value.length > 0) {
        const resData = await axios
          .get(
            `https://fsgoole.replit.app/?video_url=${value[0]["text"]}&comment=${
                  is_comment.value ? "true" : "false"
                }`
          )
          .catch((err) => {
            i++;
            progress.value = (i / recordIdList.length).toFixed(2);
          });
        if (!resData) continue;
        if (resData.data.code == 0) {
          // 视频信息
          const dic = resultMapDic(
            resData.data.data,
            target_filed_dic,
            recordId,
            value[0]["text"]
          );
          newDataArr.push(dic);
          // 视频评论
          if (is_comment.value) {
            const arr = getCommentArr(
              resData.data.comments,
              target_comment_filed_dic,
              value[0]["text"]
            );
            if (is_comment.value && arr.length > 0) {
              await addBitRecord(arr, comment_table_id.value);
            }
          }
        }
      }
      i++;
      progress.value = (i / recordIdList.length).toFixed(2);
    }
    if (export_table_id.value == import_table_id.value) {
      await bit_table.setRecords(newDataArr);
    } else {
      await addBitRecord(newDataArr, export_table_id.value);
    }
    newDataArr = [];
    Message.success(t('ts_success'));
    buttonLoading.value = false;
    bit_loading.value = false;
  }
  // 视频评论
  function getCommentArr(commentsArr, target_filed_dic, video_url) {
    const arr = [];
    for (let item of commentsArr) {
      let dic = {};
      dic = {
        fields: {
          [target_filed_dic.date]: dayjs(item["comment_time"]).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          [target_filed_dic.sender]: item["author_name"],
          [target_filed_dic.content]: item["comment_text"],
          [target_filed_dic.video_url]: video_url,
        },
      };
      for (let key in dic.fields) {
        if (key == "undefined") {
          delete dic.fields[key];
        }
      }
      arr.push(dic);
    }
    return arr;
  }
  // 视频信息
  function resultMapDic(data, target_filed_dic, recordId, video_url) {
    const snippet = data["items"][0]["snippet"];
    const statistics = data["items"][0]["statistics"];
    let dic = {};
    // 相同
    if (export_table_id.value == import_table_id.value) {
      dic = {
        recordId: recordId,
        fields: {
          [target_filed_dic.video_slt]: snippet["thumbnails"]["high"]["url"],
          [target_filed_dic.video_title]: snippet["title"],
          [target_filed_dic.video_pl_num]: statistics["commentCount"],
          [target_filed_dic.video_like_num]: statistics["favoriteCount"],
          [target_filed_dic.video_zan_num]: statistics["likeCount"],
          [target_filed_dic.video_play_num]: statistics["viewCount"],
          [target_filed_dic.video_channelTitle]: snippet["channelTitle"],
          [target_filed_dic.video_description]: snippet["description"],
          [target_filed_dic.video_push_time]: dayjs(
            snippet["publishedAt"]
          ).format("YYYY-MM-DD HH:mm:ss"),
        },
      };
    } else {
      dic = {
        fields: {
          [target_filed_dic.video_url]: video_url,
          [target_filed_dic.video_slt]: snippet["thumbnails"]["high"]["url"],
          [target_filed_dic.video_title]: snippet["title"],
          [target_filed_dic.video_pl_num]: statistics["commentCount"],
          [target_filed_dic.video_like_num]: statistics["favoriteCount"],
          [target_filed_dic.video_zan_num]: statistics["likeCount"],
          [target_filed_dic.video_play_num]: statistics["viewCount"],
          [target_filed_dic.video_channelTitle]: snippet["channelTitle"],
          [target_filed_dic.video_description]: snippet["description"],
          [target_filed_dic.video_push_time]: dayjs(
            snippet["publishedAt"]
          ).format("YYYY-MM-DD HH:mm:ss"),
        },
      };
    }
    for (let key in dic.fields) {
      if (key == "undefined") {
        delete dic.fields[key];
      }
    }
    return dic;
  }
  const commitCan = computed(() => {
    if (is_comment.value) {
      if (
        comment_table_id.value &&
        select_video_comment_arr.value.length > 0 &&
        select_video_info_arr.value.length > 0 &&
        export_table_id.value
      ) {
        return true;
      }
    } else {
      if (
        select_video_info_arr.value.length > 0 &&
        export_table_id.value &&
        bit_import_dic.value.origin_filed
      ) {
        return true;
      }
    }
    return false;
  });
  function helpVoid(params) {
    window.open(
      t('help_url'),
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
