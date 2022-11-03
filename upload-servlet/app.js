const express = require('express')

const app = express();

app.use('/', function(req, res) {
  res.send('你好')
})

app.listen(8888, function() {
  console.log('服务器启动成功，请访问http://127.0.0.1:8888')
})
