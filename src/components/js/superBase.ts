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
const baseIdkey = ref('')
bitable.base.onSelectionChange((event) => {
  // initBaeData();
  if (event.data.tableId != bit_select_dic.value.tableId) {
    initBaeData();
  }
  bit_select_dic.value = event.data;
});

async function initBaeData() {
  bit_loading.value = true;
  bit_table = await bitable.base.getActiveTable();
  const bit_selection = await bitable.base.getSelection()
  baseIdkey.value = bit_selection.baseId
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
async function addBitRecord(arr, tableId) {
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

async function oneStepCreateManConfig(name, tableId) {

  const table = await bitable.base.getTableById(tableId);
  const fieldMetaList = await table.getFieldMetaList();
  const czItem = fieldMetaList.find((a) => a["name"] == name);
  if (czItem) {
    return czItem.id;
  }
  let fileId = ''


  if (['播放数', '点赞数', '下载数', '分享数', '转发数', '评论数'].includes(name)) {
    fileId = await table.addField({ type: FieldType.Number, name: name });
  }
  if (name == '视频封面') {
    fileId = await table.addField({ type: FieldType.Url, name: "视频封面" });
  }
  if (['视频id', '视频标题'].includes(name)) {
    fileId = await table.addField({ type: FieldType.Text, name: "视频id" });
    const title = await table.addField({ type: FieldType.Text, name: "视频标题" });
  }

  if (name == '视频创建时间') {
    fileId = await table.addField({ type: FieldType.DateTime, name: "视频创建时间" });
  }
  if (name == '数据同步时间') {
    fileId = await table.addField({ type: FieldType.CreatedTime, name: "数据同步时间" });
  }
  if (name == '视频状态') {
    fileId = await table.addField({ type: FieldType.SingleSelect, name: "视频状态" });
    const video_status_option = await table.getField(fileId);
    await video_status_option.addOptions([{ name: "已发布" }, { name: "不适宜公开" }, { name: "审核中" }]);
  }
  if (name == '媒体类型') {
    fileId = await table.addField({ type: FieldType.SingleSelect, name: "媒体类型" });
    const media_type_option = await table.getField(fileId);
    await media_type_option.addOptions([{ name: "图集" }, { name: "视频" }]);
  }
  if (name == '是否置顶') {
    fileId = await table.addField({ type: FieldType.SingleSelect, name: "是否置顶" });
    const is_top_option = await table.getField(fileId);
    await is_top_option.addOptions([{ name: "是" }, { name: "否" }]);
  }
  return fileId
}

getAllTable();
export { getAllTable, bit_all_table, bit_select_dic, addBitNewTable, switchTable, oneStepCreateManConfig };
