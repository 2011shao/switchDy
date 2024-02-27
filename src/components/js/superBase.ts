import { bitable, FieldType, ITable } from "@lark-base-open/js-sdk";
import dayjs from "dayjs";
import { ref, watchEffect } from "vue";
import { Message } from "@arco-design/web-vue";

let bit_table: ITable;
const bit_loading = ref(false);
const bit_all_fieldList = ref<any>([]);
const bit_all_table = ref<any>([]);
const bit_select_dic = ref<any>({
  baseId: "",
  fieldId: "",
  recordId: "",
  tableId: "",
  viewId: "",
});
const dy_user_table_id = ref(""); //导入人员时的表
const export_table_id = ref(""); //导出人员时的表
const allUserArr = ref([]);
const dy_user_info_dic = ref({
  avatar: "头像",
  nickname: "昵称",
  open_id: "视频标题",
  access_token: "播放量",
  end_time: "授权到期时间",
});
bitable.base.onSelectionChange((event) => {
  if (event.data.tableId != bit_select_dic.value.tableId) {
    initBaeData();
    getAllTable();
  }
  bit_select_dic.value = event.data;
});

async function initBaeData() {
  bit_loading.value = true;
  bit_table = await bitable.base.getActiveTable();
  bit_select_dic.value.tableId = bit_table.id;
  getAllField(true);
}
async function getAllField(loadCache = false) {
  bit_loading.value = true;
  const fieldMetaList = await bit_table.getFieldMetaList();
  console.log("所有的字段", fieldMetaList);
  bit_all_fieldList.value = fieldMetaList;
  bit_loading.value = false;
}
async function getTableAllFieldFromId(tableId) {
  const result_table = await bitable.base.getTableById(tableId);
  const fieldMetaList = await result_table.getFieldMetaList();
  return fieldMetaList;
}
initBaeData();
export { getTableAllFieldFromId, initBaeData, getAllField, dy_user_table_id, export_table_id };
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// 新增字段
async function addBitNewField(fileName, tableId, fieldType = FieldType.Text, property = {}) {
  if (tableId == dy_user_table_id.value) {
    const czItem = bit_all_fieldList.value.find((a) => a["name"] == fileName);
    if (czItem) {
      return czItem.id;
    } else {
      const fileId = await bit_table.addField({
        type: fieldType,
        name: fileName,
        property: property,
      });
      return fileId;
    }
  } else {
    const result_table = await bitable.base.getTableById(tableId);
    const fieldMetaList = await result_table.getFieldMetaList();
    const czItem = fieldMetaList.find((a) => a["name"] == fileName);
    if (czItem) {
      return czItem.id;
    } else {
      const fileId = await result_table.addField({
        type: fieldType,
        name: fileName,
        property: property,
      });
      return fileId;
    }
  }
}
// 新增记录
async function addBitRecord(arr, tableId) {
  const result_table = await bitable.base.getTableById(tableId);
  const res = await result_table.addRecords(arr);
}

export { bit_all_fieldList, bit_loading, bit_table, addBitNewField, addBitRecord, dy_user_info_dic };

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 获取所有的表格
async function getAllTable(loadCache = false) {
  bit_all_table.value = await bitable.base.getTableMetaList();
  const exitTable = bit_all_table.value.find((a) => a["name"] == "抖音用户表");
  if (exitTable) {
    const table = await bitable.base.getTableById(exitTable.id);
    const fieldMetaList = await table.getFieldMetaList();
    let dic = {
      avatar: "头像",
      nickname: "昵称",
      open_id: "",
      access_token: "播放量",
      end_time: "授权到期时间",
      query_video_end_time: "截止日期",
      query_video_start_time: "起始日期",

    };
    const avatarItem = fieldMetaList.find((a) => a["name"] == "头像");
    if (avatarItem) {
      dic.avatar = avatarItem.id;
    } else {
      dic.avatar = await table.addField({ type: FieldType.Text, name: "头像" });
    }
    const nicknameItem = fieldMetaList.find((a) => a["name"] == "昵称");
    if (nicknameItem) {
      dic.nickname = nicknameItem.id;
    } else {
      dic.nickname = await table.addField({ type: FieldType.Text, name: "昵称" });
    }
    const open_idItem = fieldMetaList.find((a) => a["name"] == "open_id");
    if (open_idItem) {
      dic.open_id = open_idItem.id;
    } else {
      dic.open_id = await table.addField({ type: FieldType.Text, name: "open_id" });
    }
    const access_tokenItem = fieldMetaList.find((a) => a["name"] == "access_token");
    if (access_tokenItem) {
      dic.access_token = access_tokenItem.id;
    } else {
      dic.access_token = await table.addField({ type: FieldType.Text, name: "access_token" });
    }
    const end_timeItem = fieldMetaList.find((a) => a["name"] == "授权到期时间");
    if (end_timeItem) {
      dic.end_time = end_timeItem.id;
    } else {
      dic.end_time = await table.addField({ type: FieldType.DateTime, name: "授权到期时间" });
    }
    const query_video_end_timeItem = fieldMetaList.find((a) => a["name"] == "截止日期");
    if (query_video_end_timeItem) {
      dic.query_video_end_time = query_video_end_timeItem.id;
    } else {
      dic.query_video_end_time = await table.addField({ type: FieldType.DateTime, name: "截止日期" });
    }
    const query_video_start_timeItem = fieldMetaList.find((a) => a["name"] == "起始日期");
    if (query_video_start_timeItem) {
      dic.query_video_start_time = query_video_start_timeItem.id;
    } else {
      dic.query_video_start_time = await table.addField({ type: FieldType.DateTime, name: "起始日期" });
    }

    dy_user_table_id.value = exitTable.id;
    dy_user_info_dic.value = dic;
    getDyUserList();
  } else {
    dy_user_table_id.value = "";
  }
}
async function addBitNewTable(tableName) {
  const tableList = await bitable.base.getTableMetaList();
  const isExit = tableList.find((a) => a["name"] == tableName);
  if (isExit) {
    return isExit.id;
  } else {
    const { tableId, index } = await bitable.base.addTable({ name: tableName, fields: [] });
    await getAllTable();
    return tableId;
  }
}
async function switchTable(tableId) {
  await bitable.ui.switchToTable(tableId);
  initBaeData();
}
// ----------------------------------一键创建配置表
async function getDyUserList() {
  const tableId = dy_user_table_id.value;
  const table = await bitable.base.getTableById(tableId);
  // const fieldMetaList = await table.getFieldMetaList();
  const viewList = await table.getViewList();
  const view = viewList[0];
  const recordIdList = await view.getVisibleRecordIdList();
  let arr = [];
  for (const recordId of recordIdList) {
    let dic = {};
    const { fields } = await table.getRecordById(recordId);
    dic["recordId"] = recordId;
    for (let key of Object.keys(dy_user_info_dic.value)) {
      const value = fields[dy_user_info_dic.value[key]];
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) dic[key] = value[0]["text"];
        } else {
          if (["end_time", 'query_video_start_time', 'query_video_end_time']) {
            dic[key] = dayjs(value).format("YYYY-MM-DD");
          } else {
            dic[key] = value;
          }
        }
      }
    }
    if (dic["access_token"] && dic["open_id"]) {
      const czIndex = arr.findIndex((a) => a["open_id"] == dic["open_id"]);
      if (czIndex < 0) {
        arr.push(dic);
      } else {
        debugger
        if (dayjs(dic["end_time"]).isAfter(dayjs(arr[czIndex]["end_time"]))) {
          await table.deleteRecord(arr[czIndex]["recordId"]);
          arr.splice(czIndex, 1);
          arr.push(dic);
        } else {
          await table.deleteRecord(dic["recordId"]);
        }
      }
    }
  }
  allUserArr.value = arr;
  Message.success(`共${arr.length}人`);
}

async function oneStepCreateAuthUserTable() {
  const { tableId } = await bitable.base.addTable({ name: "抖音用户表", fields: [] });
  dy_user_table_id.value = tableId;
  const table = await bitable.base.getTableById(tableId);
  let dic = {
    avatar: "头像",
    nickname: "昵称",
    open_id: "视频标题",
    access_token: "播放量",
    end_time: "授权到期时间",
    query_video_start_time: "起始日期",
    query_video_end_time: "截止日期",
  };
  dic.avatar = await table.addField({ type: FieldType.Text, name: "头像" });
  dic.nickname = await table.addField({ type: FieldType.Text, name: "昵称" });
  dic.open_id = await table.addField({ type: FieldType.Text, name: "open_id" });
  dic.access_token = await table.addField({ type: FieldType.Text, name: "access_token" });
  dic.end_time = await table.addField({ type: FieldType.DateTime, name: "授权到期时间" });
  dic.query_video_start_time = await table.addField({ type: FieldType.DateTime, name: "起始日期", description: { content: "从那一天开始查取" } });
  dic.query_video_end_time = await table.addField({ type: FieldType.DateTime, name: "截止日期", description: { content: "默认为当期日期" } });
  dy_user_info_dic.value = dic;
  Message.success("创建成功");
}
async function oneStepCreateVideoTable(name, tableId) {
  const table = await bitable.base.getTableById(tableId);
  const fieldMetaList = await table.getFieldMetaList();
  const czItem = fieldMetaList.find((a) => a["name"] == name);
  if (czItem) {
    return czItem.id;
  }
  let fileId = "";
  if (["播放数", "点赞数", "下载数", "分享数", "转发数", "评论数"].includes(name)) {
    fileId = await table.addField({ type: FieldType.Number, name: name });
  } else if (name == "视频创建时间") {
    fileId = await table.addField({ type: FieldType.DateTime, name: "视频创建时间" });
  } else if (name == "数据同步时间") {
    fileId = await table.addField({ type: FieldType.CreatedTime, name: "数据同步时间" });
  } else if (name == "视频状态") {
    fileId = await table.addField({ type: FieldType.SingleSelect, name: "视频状态" });
    const video_status_option = await table.getField(fileId);
    await video_status_option.addOptions([{ name: "已发布" }, { name: "不适宜公开" }, { name: "审核中" }]);
  } else if (name == "媒体类型") {
    fileId = await table.addField({ type: FieldType.SingleSelect, name: "媒体类型" });
    const media_type_option = await table.getField(fileId);
    await media_type_option.addOptions([{ name: "图集" }, { name: "视频" }]);
  } else if (name == "是否置顶") {
    fileId = await table.addField({ type: FieldType.SingleSelect, name: "是否置顶" });
    const is_top_option = await table.getField(fileId);
    await is_top_option.addOptions([{ name: "是" }, { name: "否" }]);
  } else {
    fileId = await table.addField({ type: FieldType.Text, name: name });
  }
  return fileId;
}

getAllTable();
export { allUserArr, getDyUserList, getAllTable, bit_all_table, bit_select_dic, addBitNewTable, switchTable, oneStepCreateVideoTable, oneStepCreateAuthUserTable };
