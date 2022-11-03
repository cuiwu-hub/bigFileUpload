<script setup>
const selectFile = function(e) {
  console.log(e)
}
</script>

<template>
  <div class="fatherContainer">
    <div class="container">
      <h4>单一文件上传(formData格式)</h4>
      <div class="uploadArea">
        <div>选择文件</div>
        <input type="file" @change="selectFile">
      </div>
    </div>
    <div class="container">
      <h4>单一文件上传(base64格式)</h4>
      <div class="uploadArea">
        <div>上传文件</div>
        <input type="file">
      </div>
    </div>
    <div class="container">
      <h4>单一文件上传(base64格式)</h4>
      <div class="uploadArea">
        <div>上传文件</div>
        <input type="file">
      </div>
    </div>
    <div class="container">
      <h4>大文件上传和断点续传</h4>
      <div class="uploadArea">
        <div>上传文件</div>
        <input type="file">
      </div>
    </div>
  </div>
</template>

<style scoped>
.fatherContainer {
  display: flex;
  flex-wrap: wrap;
}
.container {
  border: 1px solid #000000;
  padding: 0 20px 20px 20px;
  margin-right: 20px;
}
.uploadArea {
  position: relative;
  display: inline-block;
}
.uploadArea div {
  background: #00ff7f;
  color: white;
  border-radius: 5px;
  padding: 5px 10px;
}
.uploadArea input {
  position: absolute;
  top: 0;
  opacity: 0;
}
</style>
