
            
    var app={

        // mongodb://localhost:27017/               无密码方式连接数据库       
        // mongodb://admin:123456@localhost:27017   有无密码方式连接数据库
        dbUrl: 'mongodb://localhost:27017', 

        dbName: 'cms',                          //数据库名称

        secret:'nodemedia2019myprivatekey1554902468992',             //拿到代码后修改为自己的secret

        api_user:'admin',                              //访问流媒体服务器信息的用户名
        
        api_pass: '123456',                           //访问流媒体服务器信息的密码

        httpPort:8009,                                  //拉流访问接口

        superAdmin:['admin']                            //超级管理员 可配置多个

    }

    module.exports=app;
        
        