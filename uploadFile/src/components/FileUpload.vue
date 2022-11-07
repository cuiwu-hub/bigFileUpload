<template>
  <div class="fatherContainer">
    <!-- 单一文件上传formData格式 -->
    <div class="container">
      <div>
        <h4>单一文件上传(formData格式)</h4>
        <input type="file" @change="selectFileFormData">
        <button @click="uploadFormData">上传到服务器</button>
      </div>
    </div>
    <!-- 单一文件上传base64格式 -->
    <div class="container">
      <div>
        <h4>单一文件上传(base64格式)</h4>
        <input type="file" @change="selectFileBase64">
        <button @click="uploadBase64">上传到服务器</button>
      </div>
    </div>
    <!-- 缩略图的实现 -->
    <div class="container">
      <div>
        <h4>单一文件上传(缩略图)</h4>
        <input type="file" @change="selectFileThumbnail">
        <button @click="uploadThumbnail">上传到服务器</button>
      </div>
      <img :src="thumbnail" alt="">
    </div>
    <!-- 进度管控的实现 -->
    <div class="container">
      <div>
        <h4>单一文件上传(进度管控)</h4>
        <input type="file" @change="selectFileProgress">
        <button @click="uploadProgress">上传到服务器</button>
        <div v-if="isShowProgress" class="upload-progress">
          <div class="progress" :style="{                                                                                                                                                                                                                                                                             width: progressWidth + '%'                                                                                                                                                                                                                                                                             }"></div>
        </div>
      </div>
    </div>
    <!-- 拖拽上传的实现 -->
    <div class="container">
      <div>
        <h4>拖拽上传</h4>
        <input type="file">
        <div class="drag-container" @dragover="dragoverFile" @drop="dropFile">
          文件拖到此处上传
        </div>
      </div>
    </div>
    <!-- 大文件切片上传和断点续传 -->
    <div class="container">
      <div>
        <h4>大文件上传和断点续传</h4>
        <input @change="selectBigFile" type="file">
        <button @click="uploadBigFile">上传到服务器</button>
        <div v-if="isShowBigFileProgress" class="upload-progress">
          <div class="progress" :style="{                                                                                                                                                                                                                                                                             width: bigFileWith + '%'                                                                                                                                                                                                                                                                             }"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import $axios from '../request/request';
import sparkMd5 from 'spark-md5'
// 单一文件上传formData格式
let _file = null
let fileName = ''
const selectFileFormData = function (e) {
  _file = e.target.files[0]
  fileName = e.target.files[0].name
}
const uploadFormData = function () {
  if (_file && fileName) {
    let formData = new FormData()
    formData.append('file', _file)
    formData.append('fileName', fileName)
    $axios.post('/single_form', formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then(res => {
      console.log(res)
    })
  } else {
    alert('请选择文件')
  }
}
// 将图片处理成base64格式的
const changeBase64 = (file) => {
  return new Promise(resolve => {
    let fileReader = new FileReader
    fileReader.readAsDataURL(file)
    fileReader.onload = (ev) => {
      resolve(ev.target.result)
    }
  })
}
// 单一文件上传base64格式的
let _fileBase64 = null
let fileNameBase64 = ''
const selectFileBase64 = (e) => {
  _fileBase64 = e.target.files[0]
  fileNameBase64 = e.target.files[0].name
}
const uploadBase64 = async () => {
  const base64File = await changeBase64(_fileBase64)
  $axios.post('/single_base64', {
    file: encodeURIComponent(base64File),
    fileName: fileNameBase64
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => {
    console.log(res)
  })
}
// 缩略图和hash重命名的实现
let _fileThumbnail = null
let fileNameThumbnail = ''
let thumbnail = ref('')
const selectFileThumbnail = async (e) => {
  _fileThumbnail = e.target.files[0]
  const { HASH, suffix } = await changeBuffer(_fileThumbnail)
  fileNameThumbnail = `${HASH}.${suffix}`
  thumbnail.value = await changeBase64(_fileThumbnail)
}
const changeBuffer = (file) => {
  return new Promise(resolve => {
    let fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)
    fileReader.onload = (ev => {
      let buffer = ev.target.result,
        spark = new sparkMd5.ArrayBuffer(),
        HASH,
        suffix;
      spark.append(buffer)
      HASH = spark.end();
      suffix = /\.([a-zA-Z0-9]+)$/.exec(file.name)[1]
      resolve({
        buffer,
        HASH,
        suffix
      })
    })
  })
}
const uploadThumbnail = async () => {
  if (!_fileThumbnail) {
    alert('请先选择文件再上传')
    return
  }
  let formData = new FormData()
  formData.append('file', _fileThumbnail)
  formData.append('fileName', fileNameThumbnail)
  try {
    const res = await $axios.post('/single-hash', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    thumbnail.value = ''
  } catch (error) {
    console.log(error)
  }
}
// 进度管控
let isShowProgress = ref(false)
let progressWidth = ref(0)
let _fileProgress = null
let _fileNameProgress = ''
const selectFileProgress = (e) => {
  _fileProgress = e.target.files[0]
  _fileNameProgress = e.target.files[0].name
}
const uploadProgress = () => {
  if (!_fileProgress) {
    alert('请先选择文件在上传')
    return
  }
  isShowProgress.value = true
  let formData = new FormData()
  formData.append('file', _fileProgress)
  formData.append('fileName', _fileNameProgress)
  try {
    $axios.post('single-progress', formData, {
      onUploadProgress(ev) {
        let { loaded, total } = ev
        isShowProgress.value = true
        progressWidth.value = loaded / total * 100
      }
    }).then(res => {
      console.log(res)
      isShowProgress.value = false
      progressWidth.value = 0
    })
  } catch (err) {
    console.log(err)
  }
}

// 拖拽上传部分
let _dropFile = null
let _fileNameDrop = ''
// 注意：dragover事件和drop事件同时绑定，要想触发drop事件必须在dragover事件中阻止默认行为
const dragoverFile = (ev) => {
  ev.preventDefault()
}
const dropFile = (ev) => {
  ev.preventDefault()
  _dropFile = ev.dataTransfer.files[0]
  _fileNameDrop = ev.dataTransfer.files[0].name
  try {
    let formData = new FormData()
    formData.append('file', _dropFile)
    formData.append('fileName', _fileNameDrop)
    $axios.post('/single-drap', formData).then(res => {
      console.log(res)
    })
  } catch (error) {
    console.log(error)
  }
}

// 大文件切片上传和断点续传
let _BigFile = null
let bigFileName = ''
let isShowBigFileProgress = ref(false)
let bigFileWith = ref(0)
const selectBigFile = (e) => {
  _BigFile = e.target.files[0]
  bigFileName = e.target.files[0].name
}
const uploadBigFile = async () => {
  // 已经上传的文件切片列表
  let alreadyList = []
  let index = 0
  // 获取文件的hash
  let { HASH, suffix } = await changeBuffer(_BigFile)
  // 存储文件切片信息
  let chunks = []
  // 实现文件的切片处理(固定数量&固定大小)
  let maxSize = 1024 * 100, count = Math.ceil(_BigFile.size / maxSize) // 固定大小获取数量
  if (count > 100) {
    count = 100, maxSize = _BigFile.size / 100
  }
  // 获取已经上传的切片
  try {
    const res = await $axios.post('/upload-already', {
      HASH
    })
    if (+res.data.code === 0) {
      alreadyList = res.data.fileList
      console.log(alreadyList)
    }
  } catch (error) {
    console.log(error)
  }
  const complete = async () => {
    index++
    bigFileWith.value = index / count * 100
    if (index < count) return
    else {
      try {
        const res = await $axios.post('upload-merge', { HASH, count })
      } catch (error) {

      }
      isShowBigFileProgress.value = false
      bigFileWith.value = 0
    }
  }
  // 将切片信息存储到chunk中
  for (let i = 0; i < count; i++) {
    chunks.push({
      file: _BigFile.slice(i * maxSize, (i + 1) * maxSize),
      fileName: `${HASH}_${i + 1}.${suffix}`
    })
  }
  // 将每一个切片都上传到服务器上
  chunks.forEach(async chunk => {
    if (alreadyList.length > 0 && alreadyList.includes(chunk.fileName)) {
      complete()
      return
    }
    isShowBigFileProgress.value = true
    let formData = new FormData()
    formData.append('file', chunk.file)
    formData.append('fileName', chunk.fileName)
    formData.append('HASH', HASH)
    $axios.post('/upload-chunk', formData).then(res => {
      complete()
    }).catch((err) => {
      console.log('切片上传失败,请稍后再试')
    })
  })
}
</script>
<style scoped>
.fatherContainer {
  display: flex;
  width: 100%;
  /* justify-content: space-between; */
  flex-wrap: wrap;
}

.container {
  display: flex;
  justify-content: center;
  width: 33.3%;
  margin-bottom: 20px;
  margin-right: 40px;
}

.upload-progress {
  width: 200px;
  height: 4px;
  background: #999999;
  margin-top: 20px;
}

.progress {
  height: 100%;
  width: 50%;
  background: skyblue;
  transition: width .3s;
}

.drag-container {
  width: 300px;
  height: 200px;
  text-align: center;
  line-height: 200px;
  border: 1px solid #000000;
}
</style>
