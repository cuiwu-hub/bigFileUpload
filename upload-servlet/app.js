const express = require('express')
const app = express();
const cors = require('cors')
const fs = require('fs')
// const multer = require('multer')
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const bodyParser = require('body-parser')
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/uploads')
//   },
//   filename: function (req, file, cb) {
//     console.log(file)
//     cb(null, file.originalname)
//   }
// })
// const upload = multer({storage})

app.use(cors()) // 设置跨域
app.use(bodyParser.json()); //将请求转换成json格式
app.use(bodyParser.urlencoded({ extended: false }))
// 单文件上传formData格式
app.post('/single_form', multipartMiddleware, (req, res) => {
  console.log(req.file)
  res.send('ok')
})

// 单文件上传base64格式
app.post('/single_base64', (req, res) => {
  const data = decodeURIComponent(req.body.file)
  console.log(req.body.fileName)
  let base64Data = data.replace(/^data:image\/\w+;base64,/, '')
  let dataBuffer = new Buffer.from(base64Data, 'base64')
  fs.writeFile(`public/uploads/${req.body.fileName}`, dataBuffer, function(err) {
    if (err) {
      res.send(err)
    } else {
      res.send('文件上传成功')
    }
  })
})

app.post('/single-hash', multipartMiddleware, (req, res) => {
  fs.readFile(req.files.file.path, function(err, data) {
    fs.writeFile(`public/uploads/${req.body.fileName}`, data, function(err) {
      if (err) {
        res.send(err)
      } else {
        res.send('文件上传成功')
      }
    })
  })
})

app.listen(8888, function() {
  console.log('服务器启动成功，请访问http://127.0.0.1:8888')
})
