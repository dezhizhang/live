const { NodeMediaServer } = require('node-media-server');

const config = {
    rtmp:{
        port:1935,
        chunk_size:60000,
        gop_cache:true,
        ping:60,
        ping_timeout:30
    },
    http:{
        port:8082,
        allow_origin:'*',
        mediaroot:'media'
    },
    auth:{
        play:true,
        publish:true,
        secret:'zhangdezhi'
    }
}

let nms = new NodeMediaServer(config);
nms.run();


