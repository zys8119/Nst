#!/usr/bin/env node
/**
 * @依赖包*/
const command = require("ncommand");
const Nserve = require("../index");
var version = require("../package.json").version;
var {execSync} = require("child_process");
var ncol = require("ncol");
const fs = require("fs");
const path = require("path");
const newCommand = new command();
const newNserve = new Nserve();
var gitProxyPath = path.resolve(__dirname,"gitProxy.json");
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
            })
            .end(function () {
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
    },
    getProxyConfig:function (){
        if(!fs.existsSync(gitProxyPath)){
            fs.writeFileSync(gitProxyPath,JSON.stringify({
                "all":"清除全局代理配置"
            }, null, 4))
        }
        var gitProxyJson = {};
        try {
            gitProxyJson = JSON.parse(fs.readFileSync(gitProxyPath).toString())
        }catch (e) {}
        return gitProxyJson;
    },
    /**
     * 使用全局GIT代理映射
     */
    proxyHelp:function (serverCommands, type){
        var argv = serverCommands.argv;
        var bool = argv.slice(1).length === ({
            rm:1,
            use:1,
            add:2,
        }[type])
        if(!bool || ["-help","-h"].includes((argv[1] || "").toLowerCase())){
            serverCommands
                .Commands({
                    log:["ls","查看全局GIT代理映射"],
                })
                .Commands({
                    log:["use","<proxyName | all> 使用全局GIT代理映射"],
                })
                .Commands({
                    log:["add","<proxyName> <proxyAddress> 添加全局GIT代理映射"],
                })
                .Commands({
                    log:["rm","<proxyName> 删除全局GIT代理映射"],
                })
                .end(function () {
                    this.showHelp();
                });
            return true
        }else {
            try {
                var gitProxyJson = this.getProxyConfig();
                var bool = argv[1].toLowerCase() === "all";
                switch (type){
                    case "use":
                        if(bool){
                            try {execSync("git config --global --unset http.nstproxyname");}catch (e) {}
                            try {execSync("git config --global --unset http.proxy");}catch (e) {}
                            try {execSync("git config --global --unset https.proxy");}catch (e) {}
                            try {execSync("npm config delete proxy");}catch (e) {}
                            try {execSync("npm config delete https-proxy");}catch (e) {}
                        }else {
                            if(gitProxyJson[argv[1]]){
                                try {execSync("git config --global http.nstproxyname " + argv[1]);}catch (e) {}
                                try {execSync("git config --global http.proxy " + gitProxyJson[argv[1]]);}catch (e) {}
                                try {execSync("git config --global https.proxy " + gitProxyJson[argv[1]]);}catch (e) {}
                                try {execSync("npm config set proxy " + gitProxyJson[argv[1]]);}catch (e) {}
                                try {execSync("npm config set https-proxy " + gitProxyJson[argv[1]]);}catch (e) {}
                            }else {
                                ncol.error(`无效配置名称 "${argv[1]}" ,请先使用 add 命令添加代理配置`)
                            }
                        }
                        break;
                    case "add":
                        if(bool){
                            ncol.error(`"${argv[1]}" 名称为保留字段，禁止覆盖`)
                        }else {
                            gitProxyJson[argv[1]] = argv[2];
                            fs.writeFileSync(gitProxyPath, JSON.stringify(gitProxyJson,null,4))
                        }
                        break;
                    case "rm":
                        if(bool){
                            ncol.error(`"${argv[1]}" 名称为保留字段，禁止覆盖`)
                        }else {
                            delete gitProxyJson[argv[1]];
                            fs.writeFileSync(gitProxyPath, JSON.stringify(gitProxyJson,null,4))
                        }
                        break;
                }
            }catch (e){
            }
            this.ls();
        }
    },
    ls:function (){
        var gitProxyJson = this.getProxyConfig();
        var listProxy = execSync("git config --global -l").toString().match(/(http|https)\.(proxy|nstproxyname).*/img) || [];
        var keys = Object.keys(gitProxyJson);
        var maxK = (keys || []).reduce((a,b)=>(a.length - b.length > 0 ?a:b),"");
        var proxyname = listProxy.find(e=>/http.nstproxyname/.test(e))
        if(proxyname){
            proxyname = /(?:=(.*))/.exec(proxyname);
            if(proxyname[1]){
                proxyname = proxyname[1].trim();
            }
        }
        var address = null;
        if(!proxyname && listProxy && listProxy.length > 0){
            address = /(?:=(.*))/.exec(listProxy[0])
            if(address[1]){
                address = address[1].trim();
            }
        }
        var isActive = false;
        keys.forEach(k=>{
            ncol.color(function (){
                var keyName = k+" "+"-".repeat(maxK.length - k.length + 5)+" ";
                var value = gitProxyJson[k];
                if((k === proxyname || value === address) && !isActive){
                    this.success("* "+keyName+value);
                    isActive = true;
                }else {
                    this
                        .log("  ")
                        .log(keyName)
                        .info(value)
                }
            })
        })
    },
}
var newNst = new Nst();
var newNstInit = function (newCommand){
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
            log:["ls","查看全局GIT代理映射"],
            callback:function () {newNst.ls();}
        })
        .Commands({
            log:["use","<proxyName> 使用全局GIT代理映射"],
            callback:function () {return newNst.proxyHelp(this, "use");}
        })
        .Commands({
            log:["add","<proxyName> <proxyAddress> 添加全局GIT代理映射"],
            callback:function () {return newNst.proxyHelp(this, "add");}
        })
        .Commands({
            log:["rm","<proxyName> 删除全局GIT代理映射"],
            callback:function () {return newNst.proxyHelp(this, "rm");}
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
        .Options({
            log:["--","...info('[-v]')","查看版本号"],
            callback:function () {newNst._version();}
        })
        .end(function () {
            newNst.showHelp.call(this);
        })
        .init(null,Function);
}

newNstInit(newCommand);

