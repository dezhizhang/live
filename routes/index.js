/**
 * Created by Administrator on 2018/3/20 0020.
 */

const router=require('koa-router')();
const tools=require('../module/tools.js');

router.use(async (ctx,next)=>{
    
    var result =await tools.readFile('./module/install.lock');
    // console.log(result);
    if(result=='error'){
        ctx.redirect('/install');
       
    }else{
        await next();
    }
    
})


router.get('/',async (ctx)=>{
    await ctx.render('default/index');
})
//注意 前台后后台匹配路由的写法不一样
router.get('/case',(ctx)=>{

    ctx.body='案例'
})

router.get('/about',async (ctx)=>{
    await ctx.render('default/about');
})

module.exports=router.routes();