
<template>
  <div>
    <a-typography-text>{{$t('app_name')}}👉
      <a-typography-text type="primary" @click="helpVoid">
        {{$t('look_hepler') }}
      </a-typography-text>
    </a-typography-text>
    <AuthView></AuthView>
 
  </div>
</template>

<script setup>
import AuthView from "./superView/AuthView.vue"
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
  
</script>

<style>
  .labelCss {
    width: 70px;
    text-align: center;
    flex-shrink: 0;
  }
</style>
