/**

 * http://mongodb.github.io/node-mongodb-native

 * http://mongodb.github.io/node-mongodb-native/3.0/api/
 */

//DB库
var MongoDB=require('mongodb');
var MongoClient =MongoDB.MongoClient;
const ObjectID = MongoDB.ObjectID;

var Config=require('./config.js');

class Db{

    static getInstance(){   /*1、单例  多次实例化实例不共享的问题*/

        if(!Db.instance){
            Db.instance=new Db();
        }
        return  Db.instance;
    }

    constructor(){

        this.dbClient=''; /*属性 放db对象*/
        this.connect();   /*实例化的时候就连接数据库*/

    }

    connect(){  /*连接数据库*/
      let _that=this;
      return new Promise((resolve,reject)=>{
          if(!_that.dbClient){         /*1、解决数据库多次连接的问题*/
              MongoClient.connect(Config.dbUrl,{ useNewUrlParser: true },(err,client)=>{

                  if(err){
                      reject(err)

                  }else{

                      _that.dbClient=client.db(Config.dbName);
                      resolve(_that.dbClient)
                  }
              })

          }else{
              resolve(_that.dbClient);

          }


      })

    }
    /*

     DB.find('user',{})  返回所有数据


     DB.find('user',{},{"title":1})    返回所有数据  只返回一列


     DB.find('user',{},{"title":1},{   返回第二页的数据
        page:2,
        pageSize:20,
        sort:{"add_time":-1}
     })
     js中实参和形参可以不一样      arguments 对象接收实参传过来的数据

    * */

    find(collectionName,json1,json2,json3){
        if(arguments.length==2){
            var attr={};
            var slipNum=0;
            var pageSize=0;

        }else if(arguments.length==3){
            var attr=json2;
            var slipNum=0;
            var pageSize=0;
        }else if(arguments.length==4){
            var attr=json2;
            var page=parseInt(json3.page) ||1;
            var pageSize=parseInt(json3.pageSize)||20;
            var slipNum=(page-1)*pageSize;

            if(json3.sort){
                var sortJson=json3.sort;
            }else{
                var sortJson={}
            }



        }else{
            console.log('传入参数错误')
        }
       return new Promise((resolve,reject)=>{
            this.connect().then((db)=>{
                //var result=db.collection(collectionName).find(json);
                var result =db.collection(collectionName).find(json1,attr).skip(slipNum).limit(pageSize).sort(sortJson);
                result.toArray(function(err,docs){
                    if(err){
                        reject(err);
                        return;
                    }
                    resolve(docs);
                })

            })
        })
    }
    update(collectionName,json1,json2){
        return new Promise((resolve,reject)=>{


                this.connect().then((db)=>{

                    //db.user.update({},{$set:{}})
                    db.collection(collectionName).updateOne(json1,{
                        $set:json2
                    },(err,result)=>{
                        if(err){
                            reject(err);
                        }else{
                            resolve(result);
                        }
                    })

                })

        })

    }
    insert(collectionName,json){
        return new  Promise((resolve,reject)=>{
            this.connect().then((db)=>{

                db.collection(collectionName).insertOne(json,function(err,result){
                    if(err){
                        reject(err);
                    }else{

                        resolve(result);
                    }
                })


            })
        })
    }

    remove(collectionName,json){

        return new  Promise((resolve,reject)=>{
            this.connect().then((db)=>{

                db.collection(collectionName).removeOne(json,function(err,result){
                    if(err){
                        reject(err);
                    }else{

                        resolve(result);
                    }
                })


            })
        })
    }
    getObjectId(id){    /*mongodb里面查询 _id 把字符串转换成对象*/

        return new ObjectID(id);
    }
    //统计数量的方法
    count(collectionName,json){

        return new  Promise((resolve,reject)=> {
            this.connect().then((db)=> {

                var result = db.collection(collectionName).countDocuments(json);
                result.then(function (count) {

                        resolve(count);
                    }
                )
            })
        })

    }


    /*

     DB.aggregate('user',[

                        { $match : { score : { $gt : 70, $lte : 90 } } },
                        { $group: { _id: null, count: { $sum: 1 } } }

     ]) 

    */
    aggregate(collectionName,aggregateArr){
        return new  Promise((resolve,reject)=> {
            this.connect().then((db)=> {

                db.collection(collectionName).aggregate(aggregateArr,
                    function (err, result) {
                        if(!err){

                            result.toArray(function(err,docs){

                                if(err){
                                    reject(err);
                                    return;
                                }
                                resolve(docs);
                            })

                        }else{
                            reject(err);
                        }
                    }
                );               
               
            })
        })

    }


  
}


module.exports=Db.getInstance();
