import { bitable, FieldType, ITable } from "@lark-base-open/js-sdk";
import { ref } from "vue";
let bit_table: ITable;
const bit_loading = ref(false);
const bit_all_fieldList = ref<any>([{ name: "ddd", id: "111", type: 1 }]);
const bit_all_table = ref<any>([]);
const bit_select_dic = ref<any>({
  baseId: "",
  fieldId: "",
  recordId: "",
  tableId: "",
  viewId: "",
});
const import_table_id = ref(""); //导入人员时的表
const export_table_id = ref(""); //导出人员时的表
const comment_table_id = ref(""); //评论表


bitable.base.onSelectionChange((event) => {
  // initBaeData();
  console.log("对对对", event);
  if (event.data.tableId != bit_select_dic.value.tableId) {
    initBaeData();
  }
  bit_select_dic.value = event.data;
});

async function initBaeData() {
  bit_loading.value = true;
  bit_table = await bitable.base.getActiveTable();
  bit_select_dic.value.tableId = bit_table.id;
  export_table_id.value = bit_table.id;
  import_table_id.value = bit_table.id;
  getAllField(true);
}
async function getAllField(loadCache = false) {
  bit_loading.value = true;
  const fieldMetaList = await bit_table.getFieldMetaList();
  console.log("所有的字段", fieldMetaList);
  bit_all_fieldList.value = fieldMetaList;
  bit_loading.value = false;
}
initBaeData();
export { initBaeData, getAllField, import_table_id, export_table_id, comment_table_id };
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// 新增字段
async function addBitNewField(fileName, tableId, fieldType = FieldType.Text, property = {}) {
  if (tableId == import_table_id.value) {
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
async function addBitRecord(arr,tableId) {
  const result_table = await bitable.base.getTableById(tableId);
  const res = await result_table.addRecords(arr);
}

export { bit_all_fieldList, bit_loading, bit_table, addBitNewField, addBitRecord };

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 获取所有的表格
async function getAllTable(loadCache = false) {
  bit_all_table.value = await bitable.base.getTableMetaList();
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

async function oneStepCreateManConfig() {
  const tableName = "抖音助手-视频信息表";
  const tableList = await bitable.base.getTableMetaList();
  const isExit = tableList.find((a) => a["name"] == tableName);
  if (isExit) {
    // switchTable(isExit.id)
    export_table_id.value = isExit.id;
    return;
  }
  const { tableId, index } = await bitable.base.addTable({ name: tableName, fields: [] });
  const table = await bitable.base.getTableById(tableId);
  await table.addField({ type: FieldType.Text, name: "视频id" });
  const cover=await table.addField({ type: FieldType.Url, name: "视频封面" });
  const title=await table.addField({ type: FieldType.Text, name: "视频标题" });
  await table.addField({ type: FieldType.Number, name: "播放量" });
  await table.addField({ type: FieldType.Number, name: "点赞数" });
  await table.addField({ type: FieldType.Number, name: "下载数" });
  await table.addField({ type: FieldType.Number, name: "分享数" });
  await table.addField({ type: FieldType.Number, name: "转发数" });
  await table.addField({ type: FieldType.Number, name: "分享数" });
  await table.addField({ type: FieldType.Number, name: "评论数" });
  await table.addField({ type: FieldType.DateTime, name: "视频创建时间" });
  await table.addField({ type: FieldType.CreatedTime, name: "数据同步时间" });
  const  video_status= await table.addField({ type: FieldType.SingleSelect, name: "视频状态"});
  const video_status_option = await table.getField(video_status);
  await video_status_option.addOptions([{ name: "已发布" }, { name: "不适宜公开" },{ name: "审核中" }]);

  const  media_type= await table.addField({ type: FieldType.SingleSelect, name: "媒体类型"});
  const media_type_option = await table.getField(video_status);
  await media_type_option.addOptions([{ name: "图集" }, { name: "视频" }]);

  const  is_top= await table.addField({ type: FieldType.SingleSelect, name: "是否置顶"});
  const is_top_option = await table.getField(video_status);
  await is_top_option.addOptions([{ name: "是" }, { name: "否" }]);


  // switchTable(tableId)
  export_table_id.value = tableId;
}

getAllTable();
export { getAllTable, bit_all_table, bit_select_dic, addBitNewTable, switchTable, oneStepCreateManConfig };
