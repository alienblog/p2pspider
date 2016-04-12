/**
 *  Torrent schema
 *
 *  Created by create caminte-cli script
 *  App based on CaminteJS
 *  CaminteJS homepage http://www.camintejs.com
 **/

/**
 *  Define Torrent Model
 *  @param {Object} schema
 *  @return {Object}
 **/
module.exports = function(schema){
    var Torrent = schema.define('torrent', {
           id : { type : schema.String, limit: 40, index : true },
           name : { type : schema.String },
           created : { type : schema.Date },
           length : { type : schema.Number },
           files : { type : schema.String },
           lastupdated : { type : schema.Date }
    },{


    });

    Torrent.afterUpdate = function(next){
      this.lastupdated = new Date();
      this.save();
      next();
    }

    return Torrent;
};