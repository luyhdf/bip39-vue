// 导入库文件作为副作用（它们会创建全局变量）
// 这些文件使用 var 声明变量，在浏览器环境中执行时会挂载到 window
import './sjcl-bip39.js'
import './wordlist_english.js'
import './jsbip39.js'

// 从 window 获取变量（这些文件执行后会在 window 上创建全局变量）
// 在浏览器环境中，var 声明的全局变量会挂载到 window
const sjcl = typeof window !== 'undefined' ? window.sjcl : globalThis.sjcl
const WORDLISTS = typeof window !== 'undefined' ? window.WORDLISTS : globalThis.WORDLISTS
const Mnemonic = typeof window !== 'undefined' ? window.Mnemonic : globalThis.Mnemonic

// 导出
export { sjcl, WORDLISTS, Mnemonic }

