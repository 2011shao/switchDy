import { createI18n } from 'vue-i18n'
import en from './en.json';
import zh from './zh.json';
import { bitable } from '@lark-base-open/js-sdk'
const i18n = createI18n({
  locale: 'zh',
  allowComposition: true, // 占位符支持
  messages: {
    en: en,
    zh: zh
  }
})

export {i18n}
bitable.bridge.getLanguage().then((lang) => {
    i18n.global.locale = lang
})
