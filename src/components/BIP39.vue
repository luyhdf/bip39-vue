<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  msg: String
})


const wordCount = ref(12)
const mnemonic = ref('')
const suggestions = ref([])
const currentWordIndex = ref(0)
const inputWords = ref([])
const status = ref('未完成')

const generateMnemonic = () => {
  const strength = wordCount.value === 12 ? 128 : 256
  const mnemonicObj = new Mnemonic("english")
  mnemonic.value = mnemonicObj.generate(strength)
  inputWords.value = mnemonic.value.split(' ')
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

const handleKeyDown = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault()
    if (suggestions.value.length > 0) {
      const currentWord = suggestions.value[currentWordIndex.value]
      const input = document.getElementById('mnemonicInput')
      if (input) {
        input.value = currentWord
        updateSuggestions(currentWord)
      }
      currentWordIndex.value = (currentWordIndex.value + 1) % suggestions.value.length
    }
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const input = document.getElementById('mnemonicInput')
    if (input && input.value) {
      const word = input.value.trim()
      if (WORDLISTS.english.includes(word)) {
        inputWords.value.push(word)
        input.value = ''
        suggestions.value = []
        currentWordIndex.value = 0
        
        if (inputWords.value.length === wordCount.value) {
          status.value = '已完成'
        } else {
          status.value = `已输入 ${inputWords.value.length}/${wordCount.value} 个单词`
        }
      }
    }
  }
}

onMounted(() => {
  const input = document.getElementById('mnemonicInput')
  if (input) {
    input.addEventListener('input', (e) => updateSuggestions(e.target.value))
  }
})
</script>

<template>
  <div class="container">
    <h1>{{ msg }}</h1>
    <div class="word-count">
      <label>
        <input type="radio" v-model="wordCount" :value="12"> 12个单词
      </label>
      <label style="margin-left: 20px;">
        <input type="radio" v-model="wordCount" :value="24"> 24个单词
      </label>
    </div>

    <button class="btn" @click="generateMnemonic">生成助记词</button>

    <div v-if="mnemonic" class="mnemonic-display">
      <div class="mnemonic-words">
        <div v-for="(word, index) in inputWords" :key="index" class="mnemonic-word">
          <span class="word-number">{{ index + 1 }}</span>
          <span class="word-text">{{ word }}</span>
        </div>
      </div>
    </div>

    <div class="output-container">
      <div class="suggestions-container">
        <div class="suggestions">
          <div v-for="(word, index) in suggestions" 
               :key="index"
               :class="{ active: index === currentWordIndex }">
            {{ word }}
          </div>
        </div>
      </div>
      <textarea id="mnemonicInput" 
                class="output-text"
                @keydown="handleKeyDown"
                placeholder="请输入助记词..."></textarea>
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

.word-count {
  margin: 20px 0;
  text-align: center;
}

.btn-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
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
  background-color: #2196F3;
}

.mnemonic-display {
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.mnemonic-words {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.mnemonic-word {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.word-number {
  color: #666;
  margin-right: 8px;
  font-size: 0.9em;
}

.word-text {
  font-family: monospace;
  font-size: 1.1em;
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

.output-text {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
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
</style>
