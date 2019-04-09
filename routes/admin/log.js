/**
 * Created by www.itying.com 
 */
const router = require('koa-router')();

const DB=require('../../module/db.js');

const tools=require('../../module/tools.js');

router.get('/clientlog',async (ctx)=>{

    var uid=ctx.session.userinfo._id;
    //统计今日连接数
    var result= await DB.aggregate('stream_connect_log',[
        { $match : { start_time : { $gt : tools.getZeroTime(), $lte : tools.getNextZeroTime() } ,uid:uid }},
        { $group: { _id: '$stream_name', count: { $sum: 1 } } },      
    ] );  

    //显示数据
    var categories=[];   
    var data=[];
    for(var i=0;i<result.length;i++){
        categories.push(`"${result[i]._id.trim()}"`);       
        data.push(result[i].count)
    }  
    await  ctx.render('admin/streamLog/clientlog',{
        data:data,
        categories:categories
    });
})

router.get('/streamLog',async (ctx)=>{

            var uid=ctx.session.userinfo._id;
            var online=ctx.query.online || 1; 
            var page=ctx.query.page ||1;
            var pageSize=10;    
            var count= await  DB.count('stream_log',{"online":parseInt(online),uid:uid});
            var result=await DB.find('stream_log',{"online":parseInt(online),uid:uid},{},{
                page:page,
                pageSize:pageSize
            });        
            await  ctx.render('admin/streamLog/index',{
                list:result,
                page:page,
                totalPages:Math.ceil(count/pageSize),
                online
            });
})



module.exports=router.routes();