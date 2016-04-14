'use strict';

var log4js = require('log4js');
var models = require('./models');
var P2PSpider = require('./lib')

log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出
    {
      type: 'file', //文件输出
      filename: 'logs/p2pspider.log', 
      maxLogSize: 1024,
      backups:3,
      category: 'normal' 
    }
  ]
});

var app = {
    logger : log4js.getLogger('normal')
};

models.init(app);

var p2p = P2PSpider({
    nodesMaxSize: 200,
    maxConnections: 400,
    timeout: 5000
});

function getFileString(info){
    var files = [];
    for(var f in info.files){
        var file = info.files[f];
        var l = files.length;
        files.push(file.path+"|"+file.length);
    }
    return files.join('*');
}

var saveMetadata = function(metadata,cb){
    try{
        if(metadata&&metadata.info&&metadata.info.name){
            var torrent = {};
            torrent.id = metadata.infohash;
            torrent.created = new Date();
            torrent.lastupdated = new Date();
            torrent.name = metadata.info.name.toString();
            
            var info = metadata.info;
            
            var length = 0;
            for(var f in info.files){
                length += info.files[f].length;
            }
            if(length==0&&info.length)
                length = info.length;
            torrent.length = length;
            torrent.files = getFileString(info);

            //fs.writeFile(dataDir+'/'+torrent.info.name+".json",JSON.stringify(torrent),function(err){
            //   if(err){
            //       console.log(err);
            //       return;
            //   }
            //});
            //console.log(torrent);
            app.models.Torrent.create(torrent,function(err,t){
                if(err){
                    cb({title:'save err',err:err},torrent);
                }else{
                    cb(null,t);
                } 
            });
        }
    }catch(e){
        cb({title:'unknow err',err:e},null);
    }
};

var checkFunc = function(infohash,cb){
    try{
        //app.logger.info("check",infohash);
        app.models.Torrent.findOne({where:{id: infohash}},function(err,result){
            if(!err&&result){
                app.models.Torrent.update({id:result.id},{lastupdated:new Date()},function(err,t){
                    if(err){
                        app.logger.warn('updated err', result);
                    }
                });
            }
            cb(null,result);
        });
    }catch(e){
        cb(e,null);
    }
}

p2p.ignore(function (infohash, rinfo, callback) {
    checkFunc(infohash,function(err,result){
        if(err){
            app.logger.error(err);
        }
        callback(!!result);
    })
});

p2p.on('metadata', function (metadata) {
    if(metadata&&metadata.info&&metadata.info.name){
        //if contains Rassian, ignore it
        if(/[а-яА-ЯЁё]/.test(metadata.info.name.toString())){
            return;
        }
    }
    saveMetadata(metadata,function(err,result){
        if(err){
            if(result){
                app.logger.warn(err.title, result);
            }else{
                app.logger.error(err.title, err.err);
            }
            
            return;
        }
        app.logger.info("saved ->",result.name);
    });
});

p2p.listen(6881, '0.0.0.0');