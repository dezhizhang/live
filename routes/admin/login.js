/**
 * Created by Administrator on 2018/3/20 0020.
 */

/*轮播图的增加修改删除*/


const DB=require('../../module/db.js');
const tools=require('../../module/tools.js');
const svgCaptcha = require('svg-captcha');

const Config=require('../../module/config.js');


//console.log(md5('123456'));
var router=require('koa-router')();
router.get('/',async (ctx)=>{
    await  ctx.render('admin/login');
})

router.post('/doLogin', async (ctx)=>{
    
    let username=ctx.request.body.username;
    let password=ctx.request.body.password;
    let code=ctx.request.body.code;
    

    if(code.toLocaleLowerCase()==ctx.session.code.toLocaleLowerCase()){       
        var result=await DB.find('admin',{"username":username,"password":tools.md5(password)});
        if(result.length>0){
            ctx.session.userinfo=result[0];        
            await DB.update('admin',{"_id":DB.getObjectId(result[0]._id)},{
                last_time:Date.now()
            })
            ctx.redirect('/admin/device');
        }else{                       
            ctx.render('admin/error',{
                message:'用户名或者密码错误',
                redirect: '/admin/login'
            })            
        }
    }else{
        ctx.render('admin/error',{
            message:'验证码失败',
            redirect: '/admin/login'
        })
    }


})


router.get('/code', async (ctx)=>{

    const captcha = svgCaptcha.create({ size:4,fontSize: 50, width: 120,height:34,background:"#cc9966" });
    ctx.session.code=captcha.text;
    ctx.response.type = 'image/svg+xml';
    ctx.body=captcha.data;
});

router.get('/loginOut',async (ctx)=>{
    ctx.session.userinfo=null;
    ctx.redirect('/admin/login');
})


module.exports=router.routes();
