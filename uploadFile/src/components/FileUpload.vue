<script setup>
import $axios from '../request/request';
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
    <!-- <div class="container">
      <div>
        <h4>单一文件上传(缩略图)</h4>
        <input type="file" @change="selectFile">
        <button @click="upload">上传到服务器</button>
      </div>
    </div>
    <div class="container">
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
  justify-content: space-between;
  flex-wrap: wrap;
}
.container {
  display: flex;
  justify-content: center;
  width: 33.3%;
  margin-bottom: 20px;
}
</style>
