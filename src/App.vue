
<template>
  <main>
    <switchDy class="p-all-5" />
    <div class="fixed-bottom  row-center-center" >
      
      <a-typography-text class="m-lr-10" @click="openDoc">Terms of Service</a-typography-text>
      <a-typography-text @click="openPrivacyDoc">Privacy Policy</a-typography-text>

    </div>
  </main>
</template>
<script setup>
import switchDy from "./components/switchDy.vue";
function openDoc(){
  window.open(
    "https://xiaoyuzhou.guodunnote.com/switchTiktok/agreement.html",
    "_blank"
  );
}
function openPrivacyDoc(){
  window.open(
    "https://xiaoyuzhou.guodunnote.com/switchTiktok/Privacy.html",
    "_blank"
  );
}
</script>

<style>
@import "@/assets/superStyle/superCss.css";
@import "@/assets/superStyle/selfCss.css";

main {
  /* padding: 103px; */
}
.labelCss {
  width: 70px;
  text-align: center;
  flex-shrink: 0;
}
h4 {
  font-size: calc(1.275rem + 0.3vw);
  margin-bottom: 1rem;
}
code {
  font-size: 0.875em;
  color: #d63384;
  word-wrap: break-word;
}
</style>
