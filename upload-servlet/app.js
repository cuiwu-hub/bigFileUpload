const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
// const multer = require('multer')
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();
const bodyParser = require("body-parser");
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/uploads')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// })
// const upload = multer({storage})

app.use(cors()); // 设置跨域
app.use(bodyParser.json()); //将请求转换成json格式
app.use(bodyParser.urlencoded({ extended: false }));
// 单文件上传formData格式
app.post("/single_form", multipartMiddleware, (req, res) => {
  console.log(req.file);
  res.send("ok");
});

// 单文件上传base64格式
app.post("/single_base64", (req, res) => {
  const data = decodeURIComponent(req.body.file);
  console.log(req.body.fileName);
  let base64Data = data.replace(/^data:image\/\w+;base64,/, "");
  let dataBuffer = new Buffer.from(base64Data, "base64");
  fs.writeFile(
    `public/uploads/${req.body.fileName}`,
    dataBuffer,
    function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send("文件上传成功");
      }
    }
  );
});

// 文件名hash编码的实现
app.post("/single-hash", multipartMiddleware, (req, res) => {
  fs.readFile(req.files.file.path, function (err, data) {
    fs.writeFile(`public/uploads/${req.body.fileName}`, data, function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send("文件上传成功");
      }
    });
  });
});

// 进度管控
app.post("/single-progress", multipartMiddleware, (req, res) => {
  fs.readFile(req.files.file.path, function (err, data) {
    fs.writeFile(`public/uploads/${req.body.fileName}`, data, function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send("文件上传成功");
      }
    });
  });
});

// 拖拽上传
app.post("/single-drap", multipartMiddleware, (req, res) => {
  fs.readFile(req.files.file.path, function (err, data) {
    fs.writeFile(`public/uploads/${req.body.fileName}`, data, function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send("文件上传成功");
      }
    });
  });
});

// 切片上传
app.post("/upload-chunk", multipartMiddleware, (req, res) => {
  let uploadDir = "public/uploads";
  let path = `${uploadDir}/${req.body.HASH}`; // 用hash生成一个临时文件夹
  !fs.existsSync(path) ? fs.mkdirSync(path) : null; // 判断该文件夹是否存在，不存在的话，新建一个文件夹
  path = `${uploadDir}/${req.body.HASH}/${req.body.fileName}`; // 将切片存到临时目录中
  writeFile(res, path, req.files.file, req.body.fileName, true);
});

// 合并切片
app.post("/upload-merge", multipartMiddleware, async (req, res) => {
  const { HASH, count } = req.body;
  try {
    const { filName, path } = await mergeChunk(HASH, count);
    res.send({
      code: 0,
      codeText: "merge sucessfully",
      url: path.replace(baseDir, FONTHOSTNAME),
    });
  } catch (e) {
    res.send({
      code: 1,
      codeText: e,
    });
  }
});

// 获取已经上传的切片
app.post("/upload-already", async (req, res) => {
  let uploadDir = 'public/uploads'
  let { HASH } = req.body;
  let path = `${uploadDir}/${HASH}`;
  let fileList = [];
  try {
    fileList = fs.readdirSync(path);
    fileList = fileList.sort((a, b) => {
      let reg = /_(\d+)/;
      return reg.exec(a)[1] - reg.exec(b)[1];
    });
    res.send({
      code: 0,
      codeText: "",
      fileList,
    });
  } catch (e) {
    res.send({
      code: 1,
      codeText: e,
      fileList: [],
    });
  }
});

// 检测文件是否已经存在
const exists = function (path) {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) resolve(false);
      return resolve(true);
    });
  });
};

// 保存切片
const writeFile = function (res, path, file, filename, stream) {
  // path: 'public/uploads/${req.body.fileName}'
  // file: req.files.file
  return new Promise((resolve, reject) => {
    if (stream) {
      //创建可读流，可写流，生成文件
      try {
        let readStream = fs.createReadStream(file.path);
        let writeStream = fs.createWriteStream(path);
        readStream.pipe(writeStream);
        readStream.on("end", () => {
          resolve({
            code: 0,
            codeText: "上传成功",
          });
          //同步地删除文件或符号链接
          // fs.unlinkSync(file.path);
          res.send({
            code: 0,
            codeText: "上传成功",
          });
        });
      } catch (err) {
        resolve({
          code: 1,
          codeText: err,
        });
        res.send({
          code: 1,
          codeText: err,
        });
      }
      return;
    }
    fs.writeFile(path, file, (err) => {
      console.log("写入文件");
      if (err) {
        reject(err);
        res.send({
          code: 1,
          codeText: err,
        });
        return;
      }

      resolve();
      res.send({
        code: 0,
        codeText: "上传成功",
        filename: filename,
        url: path.replace(baseDir, FONTHOSTNAME),
      });
    });
  }).catch(() => {});
};

// 合并切片
const mergeChunk = function (HASH, count) {
  let uploadDir = "public/uploads";
  return new Promise(async (resolve, reject) => {
    let path = `${uploadDir}/${HASH}`;
    let fileList = [];
    let suffix;
    let isExists = await exists(path); // 判断文件是否存在
    if (!isExists) {
      reject("HASH path  is not found!");
      return;
    }
    fileList = fs.readdirSync(path);
    if (fileList.length < count) {
      reject("the slice has not been uploaded!");
      return;
    }
    fileList
      .sort((a, b) => {
        let reg = /_(\d+)/;
        return reg.exec(a)[1] - reg.exec(b)[1];
      })
      .forEach((item) => {
        !suffix ? (suffix = /\.([0-9a-zA-Z]+)$/.exec(item)[1]) : null; // 处理文件后缀
        //合成文件
        fs.appendFileSync(
          `${uploadDir}/${HASH}.${suffix}`,
          fs.readFileSync(`${path}/${item}`)
        );
        fs.unlinkSync(`${path}/${item}`);
      });
    fs.rmdirSync(path); // 删除临时文件夹
    resolve({
      path: `${uploadDir}/${HASH}.${suffix}`,
      filename: `${HASH}.${suffix}`,
    });
  });
};

app.listen(8888, function () {
  console.log("服务器启动成功，请访问http://127.0.0.1:8888");
});
