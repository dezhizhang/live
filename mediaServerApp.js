const  NodeMediaServer = require('node-media-server');
const numCPUs = require('os').cpus().length;
//获取配置
var appConfig=require('./module/config.js');
const DB=require('./module/db.js');


const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30
  },
  http: {
    port: appConfig.httpPort,
    allow_origin: '*'
  },
  cluster: {
    num: numCPUs
  },
  auth: {
    api : true,
    api_user: appConfig.api_user,
    api_pass: appConfig.api_pass,
    play: true,
    publish: true,
    secret: appConfig.secret
  }
};

var nms = new NodeMediaServer(config)
nms.run();


nms.on('prePublish', async (id, StreamPath, args) => {  
  if(StreamPath){  
    var stream_name=StreamPath.slice(6);
    var result=await DB.find('device',{"stream_name":stream_name});
    //数据库不存在当前流执行断流
    if(!result.length){    
      let session = nms.getSession(id);
      session.stop()
    }
  }
  

});

nms.on('postPublish', async(id, StreamPath, args) => {
     //写入推流日志   
     if(StreamPath){      
        var stream_name=StreamPath.slice(6);
        //获取用户信息
        var result=await DB.find('device',{"stream_name":stream_name});

        //获取流信息

        var streamLogResult=await DB.find('stream_log',{"stream_name":stream_name});

        if(streamLogResult.length>0){
            await  DB.update('stream_log',{
                stream_name:stream_name               
            },{
                start_time:Date.now(),             
                online:1
            })
        }else{

          await  DB.insert('stream_log',{
            stream_name:stream_name,
            uid:result[0].uid,
            client_id:id,
            start_time:Date.now(),
            end_time:Date.now(),
            add_time:Date.now(),         
            online:1
        })
      }
    }
});
nms.on('donePublish', async(id, StreamPath, args) => {
  if(StreamPath){     
      var stream_name=StreamPath.slice(6);      
      //更新推流日志
      var streamResult=await DB.find('stream_log',{stream_name:stream_name});
      
      await  DB.update('stream_log',{
          stream_name:stream_name         
      },{
        end_time:Date.now(),
        total_time:Date.now()-streamResult[0].start_time,
        online:0
      })
  }
});



nms.on('postConnect', async(id, args) => {
  if(args.streamPath){
    var stream_name=args.streamPath.slice(6);
    var result=await DB.find('device',{"stream_name":stream_name});
    await  DB.insert('stream_connect_log',{
        stream_name:stream_name,
        uid:result[0].uid,
        client_id:id,
        start_time:Date.now(),
        end_time:Date.now(),
        add_time:Date.now(),
        ip:args.ip
    })
  }
});

nms.on('doneConnect', async(id, args) => {

    if(args.streamPath){
      //流名称
      var stream_name=args.streamPath.slice(6);
      //获取当前客户端信息
      var streamResult=await DB.find('stream_connect_log',{stream_name:stream_name,client_id:id});
      await  DB.update('stream_connect_log',{
          stream_name:stream_name,
          client_id:id 
      },{
        end_time:Date.now(),
        total_time:Date.now()-streamResult[0].start_time
      })  
    }
});
