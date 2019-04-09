/*设备的增删改查*/
const router=require('koa-router')();
const DB=require('../../module/db.js');
const tools=require('../../module/tools.js');
const appConfig=require('../../module/config.js');

router.get('/',async (ctx)=>{
   
    var page=ctx.query.page ||1;
    var pageSize=10;

    //超级管理员查看全部
    if(ctx.state.G.superAdmin){
        var count= await  DB.count('device',{});
        var deviceList=await DB.find('device',{},{},{
            page:page,
            pageSize:pageSize
        });      

    }else{
        var uid=ctx.session.userinfo._id;
        var count= await  DB.count('device',{uid:uid});
        var deviceList=await DB.find('device',{uid:uid},{},{
            page:page,
            pageSize:pageSize
        });

    }
    await  ctx.render('admin/device/index',{
        deviceList:deviceList,
        nowDate:Date.now(),
        page:page,
        totalPages:Math.ceil(count/pageSize)
    });


})

router.get('/show',async (ctx)=>{
    var id=ctx.request.query.id;
    var deviceResult= await  DB.find('device',{_id:DB.getObjectId(id)});

    var host=ctx.header.host.split(":")[0]
     //生成推流地址
    var streamName=deviceResult[0].stream_name;
    
    var expireDate=parseInt(deviceResult[0].expires_time/1000);

    var HashValue=tools.md5(`/live/${streamName}-${expireDate}-${appConfig.secret}`);

    var sign=`${expireDate}-${HashValue}`;
 
    deviceResult[0].push_stream_address=`rtmp://${host}/live/${streamName}?sign=${sign}`;

    deviceResult[0].pull_stream_rtmp_address=`rtmp://${host}:${appConfig.httpPort}/live/${streamName}?sign=${sign}`;

    deviceResult[0].pull_stream_flv_address=`http://${host}:${appConfig.httpPort}/live/${streamName}.flv?sign=${sign}`;
   
    await  ctx.render('admin/device/show',{
        list:deviceResult[0],
        prevPage:ctx.state.G.prevPage || '/admin/device',
        nowDate:Date.now()
    });

    

})
router.get('/add', async (ctx)=>{
    await  ctx.render('admin/device/add');
})

router.post('/doAdd',tools.multer().single('device_pic'),async (ctx)=>{    


    //增加的时候判断设备数量是否超过上限
    var uid=ctx.session.userinfo._id;
    var device_num=ctx.session.userinfo.device_num;    
    var count= await  DB.count('device',{uid:uid});
    if(count>=device_num){
        await ctx.render('admin/error',{
            message:'您的设备数量超过上限，请联系系统运营商',
            redirect:'/admin/device/add'
        })
        return false;
    }
    // 增加数据
    var device_name=ctx.req.body.device_name;
    var uid=ctx.session.userinfo._id;   //用户ID  设备和用户关联起来
    var device_id=ctx.req.body.device_id;
    var expires_time=tools.getUnixTime(ctx.req.body.expires_time);
    var stream_name=ctx.req.body.stream_name;
    var device_desc=ctx.req.body.device_desc;        
    //去掉 public  然后 \ 替换成 /
    var device_pic=ctx.req.file? ctx.req.file.path.substr(7).replace(/\\/g,'/') :'';
    var status=1;  

    //验证device_name
    if(device_name==''){
    
        await ctx.render('admin/error',{
            message:'设备名称不能为空',
            redirect:'/admin/device/add'
        })
        return false;
    }
    //验证stream_name
    var deviceResult=await DB.find('device',{"stream_name":stream_name});
    if(deviceResult.length>0){
        
        await ctx.render('admin/error',{
            message:'推流名称不能重复',
            redirect:'/admin/device/add'
        })
        return false;
    }    
    await  DB.insert('device',{
        device_name,device_id,expires_time,stream_name,device_desc,device_pic,uid,status
    })
    //跳转
    ctx.redirect('/admin/device');    

})


router.get('/edit',async (ctx)=>{
    var id=ctx.request.query.id;
    var deviceResult= await  DB.find('device',{_id:DB.getObjectId(id)});  
    await  ctx.render('admin/device/edit',{
        list:deviceResult[0],
        prevPage:ctx.state.G.prevPage
    });

})


router.post('/doEdit',tools.multer().single('device_pic'),async (ctx)=>{
        var prevPage=ctx.req.body.prevPage || '';  //获取上一页地址
        var id=ctx.req.body.id;
        var device_name=ctx.req.body.device_name;
        var device_id=ctx.req.body.device_id;
        var expires_time=tools.getUnixTime(ctx.req.body.expires_time);
        var stream_name=ctx.req.body.stream_name;
        var device_desc=ctx.req.body.device_desc;        
        //去掉 public  然后 \ 替换成 /
        var device_pic=ctx.req.file? ctx.req.file.path.substr(7).replace(/\\/g,'/') :'';
        var status=1;
        //验证device_name
        if(device_name==''){
            ctx.body="device_name error";
            return false;
        }
        if(device_pic){
            var json={    
                device_name,device_id,expires_time,stream_name,device_desc,device_pic,status
            }
        }else{
            var json={    
                device_name,device_id,expires_time,stream_name,device_desc,status
            }    
        }
        await  DB.update('device',{'_id':DB.getObjectId(id)},json);

        if(prevPage){
            ctx.redirect(prevPage);
        }else{
            //跳转
            ctx.redirect('/admin/device');
        }    

  
})



router.get('/delete',async (ctx)=>{    
    var id=ctx.request.query.id;
    await  DB.remove('device',{_id:DB.getObjectId(id)});
    if(ctx.state.G.prevPage){
        ctx.redirect(ctx.state.G.prevPage);
    }else{       
        ctx.redirect('/admin/device');
    }

})

//ajax 查看流名称是否存在
router.get('/hasStreamName',async (ctx)=>{
    var stream_name=ctx.request.query.stream_name;
    var deviceResult=await DB.find('device',{"stream_name":stream_name});
    if(deviceResult.length>0){
        ctx.body={
            success:false,
            message:'流名称已经存在'
        }
    }else{
        ctx.body={
            success:true,
            message:'流名称不存在'
        }
    }
})

module.exports=router.routes();


