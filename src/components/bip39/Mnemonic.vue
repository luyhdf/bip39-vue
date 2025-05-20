<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  wordCount: {
    type: Number,
    default: 12
  }
})

const emit = defineEmits(['update:words', 'update:isValid'])

const words = ref([])
const isValid = ref(false)
const activeTab = ref('list') // 当前激活的标签页：list-列表形式，text-文本形式

const generateMnemonic = () => {
  const strength = props.wordCount === 12 ? 128 : 256
  const mnemonicObj = new Mnemonic("english")
  const mnemonicStr = mnemonicObj.generate(strength)
  words.value = mnemonicStr.split(' ')
  checkMnemonicValidity()
}

const checkMnemonicValidity = () => {
  if (words.value.length !== props.wordCount) {
    isValid.value = false
    return
  }

  const mnemonic = words.value.join(' ')
  const mnemonicObj = new Mnemonic("english")
  isValid.value = mnemonicObj.check(mnemonic)
}

const clearMnemonic = () => {
  words.value = []
  isValid.value = false
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    const newWords = text.trim().split(/\s+/)

    // 检查单词数量是否正确
    if (newWords.length !== props.wordCount) {
      return
    }

    // 检查所有单词是否都在词表中
    const invalidWords = newWords.filter(word => !WORDLISTS.english.includes(word))
    if (invalidWords.length > 0) {
      return
    }

    // 更新助记词
    words.value = newWords
    checkMnemonicValidity()
  } catch (err) {
    console.error('粘贴失败:', err)
  }
}

// 监听 words 变化
watch(words, () => {
  checkMnemonicValidity()
  emit('update:words', words.value)
  emit('update:isValid', isValid.value)
}, { deep: true })

// 初始化时生成助记词
generateMnemonic()
</script>

<template>
  <div class="mnemonic-display">
    <div class="control-row">
      <div class="btn-group">
        <button class="btn" @click="generateMnemonic">生成助记词</button>
        <button class="btn btn-secondary paste-btn" @click="pasteFromClipboard">
          <span class="paste-icon">📋</span>
          <span class="paste-text">从剪切板粘贴</span>
        </button>
        <button class="btn btn-secondary" @click="clearMnemonic">清除列表</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
        列表形式
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'text' }" @click="activeTab = 'text'">
        文本形式
      </button>
    </div>

    <div v-if="activeTab === 'list'" class="mnemonic-words">
      <div v-for="index in wordCount" :key="index" class="mnemonic-word">
        <span class="word-number">{{ index }}.</span>
        <span class="word-text">{{ words[index - 1] || '' }}</span>
      </div>
    </div>

    <div v-else class="mnemonic-text">
      <textarea class="text-area" readonly :value="words.join(' ')"></textarea>
    </div>

    <div class="hint">
      <div class="hint-item">
        <span>助记词:</span>
        <span v-if="isValid">有效</span>
        <span v-else>无效</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mnemonic-display {
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.control-row {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
  font-weight: 500;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.btn-secondary {
  background-color: #f44336;
}

.paste-btn {
  background-color: #2196F3;
  padding: 10px 15px;
  gap: 8px;
}

.paste-btn:hover {
  background-color: #1976D2;
}

.paste-icon {
  font-size: 18px;
  line-height: 1;
}

.paste-text {
  white-space: nowrap;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.tab-btn {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: #4CAF50;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #4CAF50;
}

.mnemonic-words {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.mnemonic-word {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 0;
  min-height: 40px;
  transition: all 0.2s ease;
}

.mnemonic-word:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.word-number {
  color: #999;
  margin-right: 8px;
  font-size: 18px;
  font-weight: 600;
  min-width: 10px;
  text-align: right;
}

.word-text {
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  letter-spacing: 0.5px;
  text-align: left;
  padding-left: 2px;
}

.mnemonic-text {
  margin-top: 10px;
}

.text-area {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  font-size: 24px;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  background-color: white;
  line-height: 1.5;
}

.hint {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .mnemonic-words {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .mnemonic-words {
    grid-template-columns: 1fr;
  }
}
</style>
