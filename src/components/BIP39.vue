<script setup>
import { ref, onMounted, watch } from 'vue'
import MnemonicDisplay from './bip39/Mnemonic.vue'

defineProps({
  msg: String
})

const wordCount = ref(12) // 助记词数量，可选12或24个单词
const suggestions = ref([]) // 存储当前输入匹配的候选单词列表
const currentWordIndex = ref(0) // 当前选中的候选单词索引，用于Tab键切换
const inputWords = ref([]) // 存储已输入的单词数组
const currentInput = ref('') // 当前输入框中的文本内容
const isWordValid = ref(false) // 当前输入单词是否有效

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
  // 检查输入的前几个字母是否在词库中
  isWordValid.value = WORDLISTS.english.some(word => word.startsWith(currentInput.value))
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
      }
    } else if (currentInput.value) {
      // 如果没有候选词，使用当前输入
      const word = currentInput.value.trim()
      if (WORDLISTS.english.includes(word)) {
        inputWords.value.push(word)
        currentInput.value = ''
        suggestions.value = []
        currentWordIndex.value = 0
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

const handleSuggestionClick = (word) => {
  currentInput.value = word
  updateSuggestions(word)
  // 模拟按下 Enter 键确认输入
  const event = new KeyboardEvent('keydown', { key: 'Enter' })
  handleKeyDown(event)
}

const handleWordsUpdate = (newWords) => {
  inputWords.value = newWords
}

const handleValidityUpdate = (isValid) => {
  // 可以在这里处理助记词有效性变化
}
</script>

<template>
  <div class="container">
    <h1>{{ msg }}</h1>

    <MnemonicDisplay 
      :word-count="wordCount"
      @update:words="handleWordsUpdate"
      @update:isValid="handleValidityUpdate"
    />

    <div class="input-container">
      <div class="input-row">
        <div class="input-hint">
          <p>
            <span class="hint-text">输入第</span>
            <span class="hint-number">{{ inputWords.length + 1 }}</span>
            <span class="hint-text">/</span>
            <span class="hint-number">{{ wordCount }}</span>
            <span class="hint-text">个单词:</span>
          </p>
        </div>
        <div class="input-box">  
          <textarea v-model="currentInput" @input="handleInput" @keydown="handleKeyDown" class="input-text"
            placeholder="请输入助记词..."></textarea>
          <p class="word-validity" :class="{ valid: isWordValid, invalid: !isWordValid && currentInput }">
            {{ isWordValid ? '✓' : currentInput ? '✗' : '' }}
          </p>
        </div>
      </div>

      <div class="suggestions">
        <p>候选词:</p>
        <div v-for="(word, index) in suggestions" :key="index" :class="{ active: index === currentWordIndex }"
          @click="() => handleSuggestionClick(word)" class="suggestion-item">
          {{ word }}
        </div>
      </div>

      <div class="shortcut-hints">
        <div class="hint-item">
          <span class="hint-key">Tab</span>
          <span>切换候选词</span>
        </div>
        <div class="hint-item">
          <span class="hint-key">Enter</span>
          <span>确认输入</span>
        </div>
        <div class="hint-item">
          <span class="hint-key">ESC</span>
          <span>清除输入</span>
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

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 18px;
  color: #666;
  white-space: nowrap;
}

.input-box {
  position: relative;
  width: 200px; 
}

.input-text {
  width: 100%;
  height: 30px;
  padding: 8px 50px 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  resize: none;
  line-height: 30px;
  font-size: 20px;
  transition: all 0.2s ease;
  background-color: white;
  text-align: left;
}

.input-text:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  outline: none;
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
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  line-height: 1;
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

.shortcut-hints {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  color: #666;
}

.hint-key {
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.word-validity {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  width: 20px;
  text-align: center;
}

.word-validity.valid {
  color: #4CAF50;
}

.word-validity.invalid {
  color: #f44336;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .input-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .input-box {
    width: 100%;
  }

  .shortcut-hints {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
