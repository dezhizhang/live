/**
 * Created by Administrator on 2018/3/20 0020.
 */
const router=require('koa-router')();
const manage=require('./admin/manage.js');
const user=require('./admin/user.js');
const device=require('./admin/device.js');
const log=require('./admin/log.js');
const login=require('./admin/login.js');
const config=require('../module/config.js');
const tools=require('../module/tools.js');

//引入模块
var url=require('url');

router.use(async (ctx,next)=>{


    //检测程序是否安装
    var result =await tools.readFile('./module/install.lock');

    if(result=='error'){
        ctx.redirect('/install');
       
    }

    ctx.state.__ROOT__='http://'+ctx.header.host;
    ctx.state.G={        
        userinfo:ctx.session.userinfo,
        prevPage:ctx.request.headers['referer']   /*上一页的地址*/        
       
    }    
    var pathname=url.parse(ctx.request.url).pathname.substring(1);
    
     //判断是否登录
    if(ctx.session.userinfo && ctx.session.userinfo.username!=''){
            //配置全局变量
            ctx.state.G.superAdmin=config.superAdmin.indexOf(ctx.session.userinfo.username)!=-1?true:false;
            //判断是否有权限访问管理员模块 manage模块
            var moduleName=pathname.split('/')[1];
            if(moduleName=='manage'){
                if(ctx.state.G.superAdmin){
                    await  next();
                }else{

                    ctx.body="非法访问"
                }
                
            }else{

                
                await  next();
            }

    }else{  //没有登录跳转到登录页面
        if(pathname=='admin/login' || pathname=='admin/login/doLogin'  || pathname=='admin/login/code'){
            await  next();
        }else{
            ctx.redirect('/admin/login');
        }
    }



})

//配置admin的子路由  层级路由
router.get('/',(ctx)=>{
    ctx.redirect('/admin/login');
})
router.use('/manage',manage);
router.use('/login',login);
router.use('/device',device);
router.use('/user',user);
router.use('/log',log);
module.exports=router.routes();