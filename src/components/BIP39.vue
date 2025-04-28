<script setup>
import { ref, onMounted, watch } from 'vue'

defineProps({
  msg: String
})

const wordCount = ref(12) // 助记词数量，可选12或24个单词
const suggestions = ref([]) // 存储当前输入匹配的候选单词列表
const currentWordIndex = ref(0) // 当前选中的候选单词索引，用于Tab键切换
const inputWords = ref([]) // 存储已输入的单词数组
const status = ref('未完成') // 当前输入状态：未完成/已完成/已输入x个单词
const currentInput = ref('') // 当前输入框中的文本内容
const activeTab = ref('list') // 当前激活的标签页：list-列表形式，text-文本形式
const isValidMnemonic = ref(false) // 助记词是否有效

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
  ).slice(0, 8)
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

const handleSuggestionClick = (word) => {
  currentInput.value = word
  updateSuggestions(word)
  // 模拟按下 Enter 键确认输入
  const event = new KeyboardEvent('keydown', { key: 'Enter' })
  handleKeyDown(event)
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    const words = text.trim().split(/\s+/)
    
    // 检查单词数量是否正确
    if (words.length !== wordCount.value) {
      status.value = `单词数量不正确，需要${wordCount.value}个单词`
      return
    }
    
    // 检查所有单词是否都在词表中
    const invalidWords = words.filter(word => !WORDLISTS.english.includes(word))
    if (invalidWords.length > 0) {
      status.value = `包含无效单词: ${invalidWords.join(', ')}`
      return
    }
    
    // 更新助记词
    inputWords.value = words
    status.value = '已完成'
    isValidMnemonic.value = true
  } catch (err) {
    status.value = '粘贴失败，请重试'
  }
}

const checkMnemonicValidity = () => {
  if (inputWords.value.length !== wordCount.value) {
    isValidMnemonic.value = false
    return
  }
  
  const invalidWords = inputWords.value.filter(word => !WORDLISTS.english.includes(word))
  if (invalidWords.length > 0) {
    isValidMnemonic.value = false
    return
  }
  
  isValidMnemonic.value = true
}

// 监听inputWords变化
watch(inputWords, () => {
  checkMnemonicValidity()
})
</script>

<template>
  <div class="container">
    <h1>{{ msg }}</h1>

    <div class="control-row">
      <div class="word-count">
        <select v-model="wordCount" class="word-select">
          <option :value="12">12个单词</option>
          <option :value="24">24个单词</option>
        </select>
      </div>
      <div class="btn-group">
        <button class="btn" @click="generateMnemonic">生成助记词</button>
        <button class="btn btn-secondary paste-btn" @click="pasteFromClipboard">
          <span class="paste-icon">📋</span>
          <span class="paste-text">粘贴助记词</span>
        </button>
        <button class="btn btn-secondary" @click="clearMnemonic">清除列表</button>
      </div>
    </div>

    <div class="mnemonic-display">
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'list' }"
          @click="activeTab = 'list'"
        >
          列表形式
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'text' }"
          @click="activeTab = 'text'"
        >
          文本形式
        </button>
      </div>

      <div v-if="activeTab === 'list'" class="mnemonic-words">
        <div v-for="index in wordCount" :key="index" class="mnemonic-word">
          <span class="word-number">{{ index }}.</span>
          <span class="word-text">{{ inputWords[index - 1] || '' }}</span>
        </div>
      </div>

      <div v-else class="mnemonic-text">
        <textarea 
          class="text-area"
          readonly
          :value="inputWords.join(' ')"
        ></textarea>
      </div>

      <div class="hint">
        <div class="hint-item">
          <span>状态:</span>
          <span :class="['hint-key', { 'valid': isValidMnemonic, 'invalid': !isValidMnemonic }]">
            {{ status }}
          </span>
        </div>
      </div>

    </div>

    <div class="input-wrapper">

      <div class="suggestions">
          <div 
            v-for="(word, index) in suggestions" 
            :key="index" 
            :class="{ active: index === currentWordIndex }" 
            @click="() => handleSuggestionClick(word)"
            class="suggestion-item"
          >
            {{ word }}
          </div>
        </div>
      </div>
      

        <p class="input-hint">
          <span class="hint-text">正在输入第</span>
          <span class="hint-number">{{ inputWords.length + 1 }}</span>
          <span class="hint-text">/</span>
          <span class="hint-number">{{ wordCount }}</span>
          <span class="hint-text">个单词</span>
          <span class="hint-key">Tab</span>
          <span>切换候选词</span>
          <span class="hint-key">Enter</span>
          <span>确认输入</span>
        </p>

        <div class="suggestions-container">
       
        <textarea 
          v-model="currentInput"
          @input="handleInput"
          @keydown="handleKeyDown"
          class="input-text"
          placeholder="请输入助记词..."
        ></textarea>
        <button class="clear-btn" @click="clearInput" title="清除输入">
          ESC清除输入
        </button>
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
  gap: 20px;
  align-items: center;
  margin: 20px 0;
}

.word-count {
  display: flex;
  align-items: center;
}

.word-select {
  padding: 8px 12px;
  font-size: 20px;
  font-weight: 500;
  color: #333;
  background-color: white;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  min-width: 150px;
}

.word-select:hover {
  border-color: #999;
}

.word-select:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
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

.mnemonic-display {
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

.status-container {
  margin-top: 20px;
}

.suggestions-container {
  margin-bottom: 10px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.suggestion-item {
  padding: 6px 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  font-weight: 500;
}

.suggestion-item:hover {
  background-color: #f0f0f0;
  border-color: #999;
}

.suggestion-item.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-hint {
  margin: 0;
  padding: 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint-text {
  color: #666;
}

.hint-number {
  color: #4CAF50;
  font-weight: 600;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
}

.input-text {
  width: 100%;
  height: 40px;
  padding: 8px 10px;
  padding-right: 80px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  line-height: 24px;
  font-size: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.input-text:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  outline: none;
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

.hint-key.valid {
  color: #4CAF50;
}

.hint-key.invalid {
  color: #f44336;
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
