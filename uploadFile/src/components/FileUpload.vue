<script setup>
import { ref } from 'vue'
import $axios from '../request/request';
import sparkMd5 from 'spark-md5'
// 单一文件上传formData格式
let _file = null
let fileName = ''
const selectFileFormData = function(e) {
  _file = e.target.files[0]
  fileName = e.target.files[0].name
}
const uploadFormData = function() {
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
      'Content-Type':'application/x-www-form-urlencoded'
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
  const {fileName} = await changeBuffer(_fileThumbnail)
  fileNameThumbnail = fileName
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
      suffix=/\.([a-zA-Z0-9]+)$/.exec(file.name)[1]
      resolve({
        buffer,
        fileName: `${HASH}.${suffix}`
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
</script>

<template>
  <div class="fatherContainer">
    <div class="container">
      <div>
        <h4>单一文件上传(formData格式)</h4>
        <input type="file" @change="selectFileFormData">
        <button @click="uploadFormData">上传到服务器</button>
      </div>
    </div>
    <div class="container">
      <div>
        <h4>单一文件上传(base64格式)</h4>
        <input type="file" @change="selectFileBase64">
        <button @click="uploadBase64">上传到服务器</button>
      </div>
    </div>
    <div class="container">
      <div>
        <h4>单一文件上传(缩略图)</h4>
        <input type="file" @change="selectFileThumbnail">
        <button @click="uploadThumbnail">上传到服务器</button>
      </div>
      <img :src="thumbnail" alt="">
    </div>
    <!-- <div class="container">
      <div>
        <h4>单一文件上传(进度管控)</h4>
        <input type="file" @change="selectFile">
        <button @click="upload">上传到服务器</button>
      </div>
    </div>
    <div class="container">
      <div>
        <h4>多文件上传</h4>
        <input type="file" @change="selectFile" multiple>
        <button @click="upload">上传到服务器</button>
      </div>
    </div>
    <div class="container">
      <div>
        <h4>拖拽上传</h4>
      </div>
    </div> -->
  </div>
</template>

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
</style>
