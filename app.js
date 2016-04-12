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

p2p.ignore(function (infohash, rinfo, callback) {
    //console.log("ignore",infohash);
    //app.Torrent.count({where:{hash: infohash}},function(err,result){
    //	console.log(result);
    //	callback(!result);
    //});
    app.models.Torrent.findOne({where:{id: infohash}},function(err,result){
        if(!err&&result){
            result.lastupdated = new Date();
            app.models.Torrent.update({id:result.id},result,function(err,t){
                if(err){
                    console.error(err);
                }
            });
        }
        callback(!!result);
    });
    //callback(false);
});

p2p.on('metadata', function (metadata) {
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
               console.error("save error",t.name,err);
           }else{
             console.info("saved",t.id,t.name);  
           } 
        });
    }
});

p2p.listen(6881, '0.0.0.0');