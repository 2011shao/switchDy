
<template>
  <div class="grid-one p-all-1 grid-gap-5">
    <div class="row-start-center">
      <a-typography-text class="flex-shrink labelCss">
        {{ props.title }}
      </a-typography-text>
      <a-select
        allow-clear
        :trigger-props="{ preventFocus: false }"
        @change="changeValue"
        v-model="props.modelValue"
        :placeholder="$t('please_input') + props.title"
        :options="getCanOption"
        @clear="changeValue('')"
        :field-names="{ value: 'id', label: 'name' }"
        show-header-on-empty
        :show-extra-options="false"
      >
        <template #header v-if="canAdd">
          <a-input-search
            :placeholder="$t('create_new_table')"
            search-button
            :loading="addInputLoading"
            v-model="newFieldName"
            @search="sureAdd"
            :button-text="$t('sure')"
          >
          </a-input-search>
        </template>
        <template #empty>
          <a-empty>
            {{ $t('ts_empty_date') }}
          </a-empty>
        </template>
      </a-select>
    </div>
  </div>
</template>

<script setup >
import {
  bit_all_table,
  bit_select_dic,
  addBitNewTable,
  switchTable,
  export_table_id,
} from "../js/superBase";
import { cloneDeep } from "lodash";
import { computed, ref, watch, watchEffect } from "vue";
import { Message } from "@arco-design/web-vue";
import {
	useI18n
} from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  canAdd: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: "",
  },
  allFieldDic: {
    //选中的字段
    type: Object,
    default: () => {},
  },
  preSetArr: {
    //预设匹配值 姓名
    type: Array,
    default: () => [],
  },
});

const newFieldName = ref("");
const addInputLoading = ref(false);
async function sureAdd() {
  addInputLoading.value = true;
  newFieldName.value = newFieldName.value.trim();
  if (newFieldName.value) {
    const newTableId = await addBitNewTable(newFieldName.value);
    changeValue(newTableId);
  } else {
    Message.info(t('ts_table_no_empty'));
  }
  addInputLoading.value = false;
}

const emit = defineEmits(["update:modelValue"]);
function changeValue(e) {
  emit("update:modelValue", e);
}

const getCanOption = computed(() => {
  const tableList = cloneDeep(bit_all_table.value);
  const allFieldArr = Object.values(props.allFieldDic);
  for (let item of tableList) {
    item["disabled"] = false;
    if (allFieldArr.includes(item.id)) {
      item["disabled"] = true;
      continue;
    }
    if (props.preSetArr.includes(item.name) && !props.modelValue) {
      emit("update:modelValue", item.id);
    }
  }
  return tableList;
});
</script>
<style>
.labelCss {
  width: 70px;
  text-align: center;
  flex-shrink: 0;
}
</style>
