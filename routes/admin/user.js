/**
 * Created by www.itying.com 
 */
const router = require('koa-router')();

const DB=require('../../module/db.js');

const tools=require('../../module/tools.js');

router.get('/edit',async (ctx)=>{

    var uid=ctx.session.userinfo._id;
    
    var result=await DB.find("admin",{"_id":DB.getObjectId(uid)});

    await ctx.render('admin/user/edit',{
       list:result[0]
   })

})

router.post('/doEdit',async (ctx)=>{
    
          try {                
                var uid=ctx.session.userinfo._id;  
                var password=ctx.request.body.password;
                var rpassword=ctx.request.body.rpassword;               
                if(password!=''){
                    if(password!=rpassword || password.length<6){
                        await ctx.render('admin/error',{
                            message:'密码和确认密码不一致，或者密码长度小于6位',
                            redirect:'/admin/user/edit'
                        })
                    }else{
                        password=tools.md5(password);
                        //更新密码
                        await DB.update('admin',{"_id":DB.getObjectId(uid)},{password});
                        await ctx.render('admin/error',{
                            message:'密码修改成功',
                            redirect:'/admin/user/edit'
                        })
                    }
                }
          }catch (error) {
                await ctx.render('admin/error',{
                    message:'参数错误',
                    redirect:'/admin/user/edit'
                })
          }
})



module.exports=router.routes();