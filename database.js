/**
 *  Default database configuration file
 *
 *  Created by create caminte-cli script
 *  App based on CaminteJS
 *  CaminteJS homepage http://www.camintejs.com
 *
 *  docs: https://github.com/biggora/caminte/wiki/Connecting-to-DB#connecting
 **/

module.exports.p2pspider = {
    driver     : 'mysql',
    host       : process.env.MYSQL_ADDR,
    port       : process.env.MYSQL_PORT,
    username   : process.env.MYSQL_USER,
    password   : process.env.MYSQL_PWD,
    database   : process.env.MYSQL_DBNAME,
    autoReconnect : true
};

module.exports.dev = {
    driver     : 'mysql',
    host       : '192.168.1.227',
    port       : 3306,
    username   : 'p2pspider',
    password   : 'p2pspider',
    database   : 'p2pspider',
    autoReconnect : true
};