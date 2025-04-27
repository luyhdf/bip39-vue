<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
// import HelloWorld from './components/HelloWorld.vue'
import BIP39 from './components/BIP39.vue'

const isSingleFile = window.location.pathname.includes('singleHtml')

const downloadSingleFile = async () => {
  try {
    const response = await fetch('/bip39-vue/singleHtml/index.html')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'singleHtml.html'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('下载失败:', error)
  }
}
</script>

<template>
  <div class="version-info">
    <div class="version-content">
      <span>当前为</span>
      <span v-if="isSingleFile" class="version-tag offline">单HTML文件版本</span>
      <span v-else class="version-tag online">在线版本</span>
      <span class="separator">|</span>
      <span>可点击下载</span>
      <button @click="downloadSingleFile" class="download-btn">单HTML文件</button>
      <span>下载后，建议在无网络环境下双击HTML文件使用</span>
    </div>
  </div>
  <div class="main-content">
    <!-- <HelloWorld msg="Hello Vue 3 + Vite" /> -->
    <!-- <div class="separator">--------------------------------</div> -->
    <BIP39 msg="BIP39 助记词备份还原工具" />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.version-info {
  background-color: #f5f5f5;
  padding: 10px;
  text-align: center;
}

.version-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  position: relative;
  /* left: 200px; */
}

/* .main-content {
  margin-top: 20px;
} */

.version-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.version-tag.online {
  background-color: #4CAF50;
  color: white;
}

.version-tag.offline {
  background-color: #2196F3;
  color: white;
}

.separator {
  color: #999;
  margin: 0 8px;
}

.download-btn {
  padding: 4px 8px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 4px;
  text-decoration: underline;
}

.download-btn:hover {
  background-color: #f57c00;
  /* text-decoration: none; */
}
</style>
