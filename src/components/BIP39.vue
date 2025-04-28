<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  msg: String
})

const wordCount = ref(12) // 助记词数量，可选12或24个单词
const suggestions = ref([]) // 存储当前输入匹配的候选单词列表
const currentWordIndex = ref(0) // 当前选中的候选单词索引，用于Tab键切换
const inputWords = ref([]) // 存储已输入的单词数组
const status = ref('未完成') // 当前输入状态：未完成/已完成/已输入x个单词
const currentInput = ref('') // 当前输入框中的文本内容

const generateMnemonic = () => {
  const strength = wordCount.value === 12 ? 128 : 256
  const mnemonicObj = new Mnemonic("english")
  const mnemonicStr = mnemonicObj.generate(strength)
  inputWords.value = mnemonicStr.split(' ')
  currentWordIndex.value = 0
  status.value = '已完成'
}

const updateSuggestions = (input) => {
  if (!input) {
    suggestions.value = []
    return
  }
  suggestions.value = WORDLISTS.english.filter(word => 
    word.startsWith(input.toLowerCase())
  ).slice(0, 5)
}

const handleInput = () => {
  // 只保留字母，转换为小写
  currentInput.value = currentInput.value.replace(/[^a-zA-Z]/g, '').toLowerCase()
  updateSuggestions(currentInput.value)
}

const handleKeyDown = (event) => {

  if (event.key === 'Tab') {
    event.preventDefault()
    if (suggestions.value.length > 0) {
      const currentWord = suggestions.value[currentWordIndex.value]
      currentInput.value = currentWord
      updateSuggestions(currentWord)
      currentWordIndex.value = (currentWordIndex.value + 1) % suggestions.value.length
    }
  } else if (event.key === 'Enter') {
    event.preventDefault()
    if (suggestions.value.length > 0) {
      // 如果有候选词，使用当前选中的候选词
      const selectedWord = suggestions.value[currentWordIndex.value]
      if (WORDLISTS.english.includes(selectedWord)) {
        inputWords.value.push(selectedWord)
        currentInput.value = ''
        suggestions.value = []
        currentWordIndex.value = 0
        
        if (inputWords.value.length === wordCount.value) {
          status.value = '已完成'
        } else {
          status.value = `已输入 ${inputWords.value.length}/${wordCount.value} 个单词`
        }
      }
    } else if (currentInput.value) {
      // 如果没有候选词，使用当前输入
      const word = currentInput.value.trim()
      if (WORDLISTS.english.includes(word)) {
        inputWords.value.push(word)
        currentInput.value = ''
        suggestions.value = []
        currentWordIndex.value = 0
        
        if (inputWords.value.length === wordCount.value) {
          status.value = '已完成'
        } else {
          status.value = `已输入 ${inputWords.value.length}/${wordCount.value} 个单词`
        }
      }
    }
  } else if (event.key === 'Escape') {
    event.preventDefault()
    clearInput()
  }
}

const clearInput = () => {
  currentInput.value = ''
  suggestions.value = []
  currentWordIndex.value = 0
}

const clearMnemonic = () => {
  inputWords.value = []
  status.value = '未完成'
}
</script>

<template>
  <div class="container">
    <h1>{{ msg }}</h1>

    <div class="control-row">
      <div class="word-count">
        <label>
          <input type="radio" v-model="wordCount" :value="12"> 12个单词
        </label>
        <label>
          <input type="radio" v-model="wordCount" :value="24"> 24个单词
        </label>
      </div>
      <div class="btn-group">
        <button class="btn" @click="generateMnemonic">生成助记词</button>
        <button class="btn btn-secondary" @click="clearMnemonic">清除列表</button>
      </div>
    </div>

    <div class="mnemonic-display">
      <div class="mnemonic-words">
        <div v-for="index in wordCount" :key="index" class="mnemonic-word">
          <span class="word-number">{{ index }}.</span>
          <span class="word-text">{{ inputWords[index - 1] || '' }}</span>
        </div>
      </div>
    </div>

    <div class="output-container">
      <div class="suggestions-container">
        <div class="suggestions">
          <div v-for="(word, index) in suggestions" :key="index" :class="{ active: index === currentWordIndex }" @click="() => {
            currentInput.value = word;
            updateSuggestions(word);
          }">
            {{ word }}
          </div>
        </div>
      </div>
      <div class="input-wrapper">
        <textarea 
          v-model="currentInput"
          @input="handleInput"
          @keydown="handleKeyDown"
          class="output-text"
          placeholder="请输入助记词..."
        ></textarea>
        <button class="clear-btn" @click="clearInput" title="清除输入">
          ESC清除输入
        </button>
      </div>
      <div class="hint">
        <div class="hint-item">
          <span class="hint-key">Tab</span>
          <span>切换候选词</span>
        </div>
        <div class="hint-item">
          <span class="hint-key">Enter</span>
          <span>确认输入</span>
        </div>
        <div class="hint-item">
          <span>已输入</span>
          <span class="hint-key">{{ inputWords.length }}</span>
          <span>/</span>
          <span class="hint-key">{{ wordCount }}</span>
          <span>个单词</span>
        </div>
        <div class="hint-item">
          <span>状态:</span>
          <span class="hint-key">{{ status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.word-count {
  display: flex;
  gap: 20px;
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
}

.btn-secondary {
  background-color: #f44336;
}

.mnemonic-display {
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

.output-container {
  margin-top: 20px;
}

.suggestions-container {
  margin-bottom: 10px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.suggestions div {
  padding: 5px 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
}

.suggestions div.active {
  background-color: #4CAF50;
  color: white;
}

.input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
  white-space: nowrap;
}

.clear-btn:hover {
  color: #666;
}

.output-text {
  width: 100%;
  height: 40px; /* 改为固定高度 */
  padding: 8px 10px;
  padding-right: 80px; /* 为清除按钮留出更多空间 */
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none; /* 禁止调整大小 */
  line-height: 24px; /* 设置行高 */
  font-size: 16px; /* 设置字体大小 */
  overflow: hidden; /* 隐藏滚动条 */
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

.hint-key {
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
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
