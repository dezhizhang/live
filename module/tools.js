/**
 * Created by Administrator on 2018/3/21 0021.
 */
const md5 = require('md5');
const sd = require('silly-datetime');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mz-modules/mkdirp');

//上传图片的模块
const multer = require('koa-multer');
let tools = {
    multer() {  /*上传图片的配置*/
        var storage = multer.diskStorage({
            destination: async (req, file, cb) => {

                var uploadDir = 'public/upload'

                // 1、获取当前日期     20180920
                var day = sd.format(new Date(), 'YYYYMMDD');
                //2、创建图片保存的路径        
                var dir = path.join(uploadDir, day);
                await mkdirp(dir);
                cb(null, dir);
            },
            filename: function (req, file, cb) {
                var fileFormat = (file.originalname).split(".");   /*获取后缀名  分割数组*/
                cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
            }
        })
        var upload = multer({ storage: storage });
        return upload

    },
    getTime() {

        return new Date()
    },

    getZeroTime() {
        const start = new Date(new Date(new Date().toLocaleDateString()).getTime());
        var d = new Date(start);
        return d.getTime();
    },
    getNextZeroTime() {
        const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
        var d = new Date(end);
        return d.getTime();
    },
    getUnixTime(str) {

        try {
            if (str) {
                var d = new Date(str);
            } else {
                var d = new Date();
            }
            return d.getTime();

        } catch (error) {
            var d = new Date();
            return d.getTime();
        }
    },
    md5(str) {
        return md5(str)
    },

    readFile(path) {
        return new Promise((resove, reject) => {
            fs.readFile(path, (err,data) => {
                if (err) {
                    // console.log(err);
                    resove('error');

                } else {
                    resove(data);
                }

            })

        })
    },

    writeFile(path, data, options) {

        return new Promise((resove, reject) => {
            fs.writeFile(path, data, (err) => {
                if (err) {

                    resove('error');

                    // return false;
                } else {

                    resove('success');
                }
            })

        })


    },

    unlinkFile(path, data, options) {

        return new Promise((resove, reject) => {
            fs.unlink(path, (err) => {
                if (err) {

                    resove('error');

                    // return false;
                } else {

                    resove('success');
                }



            })

        })

    },

    testDbConnect(dbUrl,dbName,username,password) {

        //引入mongod测试连接
        var MongoClient = require('mongodb').MongoClient;
        return new Promise((resolve, reject) => {

            MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, client) => {
                if (err) {
                    // console.log(err);
                    resolve('error')

                } else {
                    var db=client.db(dbName);
                    db.collection('admin').insertOne({
                        username:username,
                        password:this.md5(password),
                        last_time:Date.now(),
                        status:1
                    },function(err,result){
                        if(err){
                            // console.log(err);
                            resolve('error');
                        }else{
    
                            resolve('success');
                        }
                    })                   
                }
            })


        })

    }
}

module.exports = tools;