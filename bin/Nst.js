#!/usr/bin/env node
/**
 * @依赖包*/
const command = require("ncommand");
const Nserve = require("../index");
var version = require("../package.json").version;
const newCommand = new command();
const newNserve = new Nserve();
var Nst = function () {
    this.publicCommand = {
        _server:function (serverCommands) {
            serverCommands
            .Commands({
                log:["-c","创建一个服务,默认是当前执行命令的路径," +
                "如果需要指定服务路径，请使用【-p】命令，" +
                "端口为3000,如果需要指定端口，请使用【-l】命令，"+
                "访问路径默认为本地跟局域网都可以,如果需要更换，请使用【-host】命令"
                ],
                callback:function () {
                    return newNst.createService.call(this);
                }
            })
            .Commands({
                log:["-l","...warn('<port>')","创建一个指定的端口服务"],
                callback:function (oldArgv,newArgv) {
                    return newNst.createService.call(this,{port:parseInt(newArgv[0])});
                }
            })
            .Commands({
                log:["-p","...warn('<PathUrl>')","一个路径，指定需创建服务的文件路径"],
                callback:function (oldArgv,newArgv) {
                    return newNst.createService.call(this,{
                        home:newArgv[0]
                    });
                }
            })
            .Commands({
                log:["-s","...warn('<httpUrl>')","指定访问路径，包含端口号，例如：127.0.0.1:8080"],
                callback:function (oldArgv,newArgv) {
                    if(newArgv.length > 0 && newArgv[0].split(":").length > 1){
                        return newNst.createService.call(this,{
                            host:newArgv[0].split(":")[0],
                            port:parseInt(newArgv[0].split(":")[1]),
                        });
                    }else{
                        newCommand.ERR("参数错误，例如：127.0.0.1:8080");
                    }
                }
            })
            .Commands({
                log:["-host","...warn('<host>')","指定访问地址，例如127.0.0.1/192.168...等"],
                callback:function (oldArgv,newArgv) {
                    return newNst.createService.call(this,{
                        host:newArgv[0],
                    });
                }
            })
            .Commands({
                log:["-init-page","...warn('<initPageName>')","指定默认请求页面，initPageName【String|Array】,前提需开启不显示文件目录"],
                callback:function (oldArgv,newArgv) {
                    return newNst.createService.call(this,{
                        InitHomefile:newArgv[0],
                    });
                }
            }).end(function () {
                newNst.showHelp.call(this);
            });
            return true;
        }

    }
}
Nst.prototype = {
    createService:function (serviceOptions) {
        serviceOptions = serviceOptions || {};
        newNserve.server(serviceOptions);
        this.init(null,Function);
        return true;
    },
    _version:function () {
        console.log(version);
    },
    showHelp:function () {
        this
            .Options({
                log:["help","...info('[-h]')","查看帮助命令"]
            })
            .end(function () {
                this.showHelp();
            })
    }
}
var newNst = new Nst();
newCommand
    .end(function () {
        this.console
            .color(function () {
                this
                    .log(`where`)
                    .info(" <command|options> ")
                    .log("is one of:");
            })
            .log(`    -s, serve, -v, --version, -h, help`)
    })
    .Commands({
        log:["-s"],
        output:false,
        callback:function () {
            this.init(null,Function);
            return newNst.publicCommand._server(this);
        }
    })
    .Commands({
        log:["serve","...info('[-s]')","服务命令"],
        callback:function () {
            return newNst.publicCommand._server(this);
        }
    })
    .Options({
        log:["-v","查看版本号"],
        output:false,
        callback:function () {newNst._version();}
    })
    .Options({
        log:["--version","...info('[-v]')","查看版本号"],
        callback:function () {newNst._version();}
    })
    .end(function () {
        newNst.showHelp.call(this);
    })
    .init(null,Function);