/**
 * Created by Administrator on 2018/3/20 0020.
 */

const router=require('koa-router')();

const tools=require('../module/tools.js');
const url=require('url');

router.use(async (ctx,next)=>{

   
    var result =await tools.readFile('./module/install.lock');
  
    var pathname=url.parse(ctx.request.url).pathname.substring(1);


    if(result=='error'){
        await next();   
    }else{

        if(pathname=='install/done'){
            await next();       

        }else{
            ctx.redirect('/admin');

        }
    }
    
})

router.get('/',async (ctx)=>{

    await ctx.render('install/index');
})

router.get('/done',async (ctx)=>{

    await ctx.render('install/done',{

       host:'http://'+ctx.header.host+'/admin'
    });
})

router.post('/doInstall',async (ctx)=>{
   
    var dbHost=ctx.request.body.dbHost;
    var dbUser=ctx.request.body.dbUser;
    var dbPassword=ctx.request.body.dbPassword;       
    var dbName=ctx.request.body.dbName;
    var username=ctx.request.body.username;
    var password=ctx.request.body.password;

    if(dbUser!=''&& dbPassword!=''){
        var dbUrl =`mongodb://${dbUser}:${dbPassword}@${dbHost}`;
    }else{
        var dbUrl =`mongodb://${dbHost}`;
    }

    var secret="nodemedia2019myprivatekey"+Date.now();
   

    var configData=`
            
    var app={

        // mongodb://localhost:27017/               无密码方式连接数据库       
        // mongodb://admin:123456@localhost:27017   有无密码方式连接数据库
        dbUrl: '${dbUrl}', 

        dbName: '${dbName}',                          //数据库名称

        secret:'${secret}',             //拿到代码后修改为自己的secret

        api_user:'${username}',                              //访问流媒体服务器信息的用户名
        
        api_pass: '${password}',                           //访问流媒体服务器信息的密码

        httpPort:8009,                                  //拉流访问接口

        superAdmin:['${username}']                            //超级管理员 可配置多个

    }

    module.exports=app;
        
        `;
    var result=await tools.writeFile('./module/config.js',configData);

    await tools.writeFile('./module/install.lock','install.lock');   
    ctx.body={

        success:result
    };
    

})

router.get('/checkFile',async (ctx)=>{

   var result=await tools.writeFile('./module/index.html','');
   if(result=='success'){
        await tools.unlinkFile('./module/index.html');
   }
   //{"success":"success"}  {"success":"error"}
   ctx.body={
        success:result
   };
    
})



router.post('/checkMongodb',async (ctx)=>{

 
    var dbHost=ctx.request.body.dbHost;
    var dbUser=ctx.request.body.dbUser;
    var dbPassword=ctx.request.body.dbPassword;       
    var dbName=ctx.request.body.dbName;
    var username=ctx.request.body.username;
    var password=ctx.request.body.password;

       
    if(dbUser!=''&& dbPassword!=''){
        var dbUrl =`mongodb://${dbUser}:${dbPassword}@${dbHost}`;
    }else{
        var dbUrl =`mongodb://${dbHost}`;
    }
    var result=await tools.testDbConnect(dbUrl,dbName,username,password);

    ctx.body={
 
         success:result
    };
        
 })





module.exports=router.routes();