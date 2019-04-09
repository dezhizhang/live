/**
 * Created by Administrator on 2018/3/20 0020.
 */
const router = require('koa-router')();

const DB=require('../../module/db.js');

const tools=require('../../module/tools.js');

router.get('/',async (ctx)=>{

    var page=ctx.query.page ||1;
    var pageSize=10;    
    var count= await  DB.count('admin',{"status":1});
    var result=await DB.find('admin',{"status":1},{},{
        page:page,
        pageSize:pageSize
    });        
    await  ctx.render('admin/manage/index',{
        list:result,
        page:page,
        totalPages:Math.ceil(count/pageSize)
    });
})

router.get('/midden',async (ctx)=>{

    var result= await DB.find('admin',{"status":0});

    await  ctx.render('admin/manage/midden',{

        list:result
    });
})


router.get('/add',async (ctx)=>{

    await  ctx.render('admin/manage/add');

})

router.post('/doAdd',async (ctx)=>{

    var username=ctx.request.body.username;
    var password=ctx.request.body.password;
    var rpassword=ctx.request.body.rpassword;
    var name=ctx.request.body.name;
    var phone=ctx.request.body.phone;    
    var address=ctx.request.body.address;
    var year_fee=ctx.request.body.year_fee;
    var device_num=ctx.request.body.device_num;       

    if(!/^\w{4,20}/.test(username)){
        await ctx.render('admin/error',{
            message:'用户名不合法',
            redirect:'/admin/manage/add'
        })
    }else if(password!=rpassword ||password.length<6){
           await ctx.render('admin/error',{
                message:'密码和确认密码不一致，或者密码长度小于6位',
                redirect:'/admin/manage/add'
            })

    }else{
        //数据库查询当前管理员是否存在
        var findResult=await  DB.find('admin',{"username":username});
        if(findResult.length>0){
            await  ctx.render('admin/error',{
                message:'此管理员已经存在，请换个用户名',
                redirect:'/admin/manage/add'
            })

        }else{
           password=tools.md5(password);
            //增加管理员
           await DB.insert('admin',{username,password,name,phone,address,year_fee,device_num,"last_time":'',"status":1});

           
           ctx.redirect('/admin/manage');
        }

    }

})


router.get('/edit',async (ctx)=>{
    var id=ctx.query.id;
    var result=await  DB.find("admin",{"_id":DB.getObjectId(id)});
    await ctx.render('admin/manage/edit',{
       list:result[0]
   })

})

router.post('/doEdit',async (ctx)=>{    
          try {                
                var id=ctx.request.body.id;          
                var password=ctx.request.body.password;
                var rpassword=ctx.request.body.rpassword;
                var name=ctx.request.body.name;
                var phone=ctx.request.body.phone;    
                var address=ctx.request.body.address;
                var year_fee=ctx.request.body.year_fee;
                var device_num=ctx.request.body.device_num;

                if(password!=''){
                    if(password!=rpassword ||password.length<6){

                        await ctx.render('admin/error',{
                            message:'密码和确认密码不一致，或者密码长度小于6位',
                            redirect:'/admin/manage/edit?id='+id
                        })

                    }else{
                        password=tools.md5(password);
                        //更新密码
                        await DB.update('admin',{"_id":DB.getObjectId(id)},{password,name,phone,address,year_fee,device_num});
                        ctx.redirect('/admin/manage');
                    }
                }else{
                        //不更新密码
                        await DB.update('admin',{"_id":DB.getObjectId(id)},{name,phone,address,year_fee,device_num});
                        ctx.redirect('/admin/manage');
                }

          } catch (error) {
                await ctx.render('admin/error',{
                    message:'参数错误',
                    redirect:'/admin/manage'
                })

          } 
})


//禁用管理员
router.get('/disable',async (ctx)=>{
    var id=ctx.request.query.id;   
    await DB.update('admin',{"_id":DB.getObjectId(id)},{"status":0});        
    if(ctx.state.G.prevPage){
        ctx.redirect(ctx.state.G.prevPage);
    }else{
        //跳转
        ctx.redirect('/admin/manage');
    }
})
//恢复管理员
router.get('/recovery',async (ctx)=>{
    var id=ctx.request.query.id;
    await DB.update('admin',{"_id":DB.getObjectId(id)},{"status":1});        
    if(ctx.state.G.prevPage){
        ctx.redirect(ctx.state.G.prevPage);
    }else{
        //跳转
        ctx.redirect('/admin/manage');
    }
})

//删除管理员
router.get('/delete',async (ctx)=>{
    var id=ctx.request.query.id;        
    await DB.remove('admin',{"_id":DB.getObjectId(id),"status":0});        
    if(ctx.state.G.prevPage){
        ctx.redirect(ctx.state.G.prevPage);
    }else{
        //跳转
        ctx.redirect('/admin/manage');
    }
})

//ajax 查看管理员是否存在
router.get('/hasUsername',async (ctx)=>{
    var username=ctx.request.query.username;
    var userResult=await DB.find('admin',{"username":username});
    if(userResult.length>0){
        ctx.body={
            success:false,
            message:'用户名已经存在'
        }
    }else{
        ctx.body={
            success:true,
            message:'用户名不存在'
        }
    }
})

module.exports=router.routes();