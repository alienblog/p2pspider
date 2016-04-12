'use strict';

var models = require('./models');
var P2PSpider = require('./lib')

var app = {};

models.init(app);

var p2p = P2PSpider({
    nodesMaxSize: 200,
    maxConnections: 400,
    timeout: 5000
});

function getFileString(info){
    var files = "";
    for(var f in info.files){
        var file = info.files[f];
        var l = files.length;
        files+=file.path+"|"+file.length;
        if(l==0&&files.length>0){
            files+="*";
        }
    }
    return files;
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
        app.models.Torrent.findOne({where:{id: infohash}},function(err,result){
            if(!err&&result){
                app.models.Torrent.update({id:result.id},{lastupdated:new Date()},function(err,t){
                    if(err){
                        console.log("updated err");
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
        callback(!!result);
    })
});

p2p.on('metadata', function (metadata) {
    saveMetadata(metadata,function(err,result){
        if(err){
            console.log(err.title,result?result.name:err.err);
            return;
        }
        console.log("saved ->",result.name);
    });
});

p2p.listen(6881, '0.0.0.0');