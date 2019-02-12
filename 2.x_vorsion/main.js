
//用子游戏去包裹大厅
window.boot = function () {

    
        var _CCSettings = null;

        cc.INGAME = "";
        cc.log(cc.INGAME);

        if (!cc.bcbm) {
            require(cc.INGAME + 'src/settings.js');
            _CCSettings = window._CCSettings;
            window._CCSettings = undefined;
            require(cc.INGAME + 'src/' + (_CCSettings.debug ? 'project.dev.js' : 'project.js'));
        } else {
            _CCSettings = cc.bcbm;
        }
        
        var settings = _CCSettings;
        
        cc.bcbm = settings;
       // console.log('cc.bcbm', JSON.stringify(cc.bcbm));

        var settingPath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + "update/hall/";
        window.require(settingPath + 'src/settings.js');
    
        _CCSettings = window._CCSettings;
        window._CCSettings = undefined;
       
        var hallSetting = _CCSettings;
    
        ///////////////////////合并assetTypes(资源类型)，重新配置settings.rawAssets.assets资源索引//////////////////////////////
        //例如:"05GIMY+wtHEqGsMAsnZWZq": ["games/bjl/audios/com/START_W.mp3", 0],
        var gameAssetTypes = settings.assetTypes;
        settings.assetTypes = hallSetting.assetTypes;
        
        //保证新的 settings.assetTypes  是大厅和子游戏的并集
        for(var typeIndex in gameAssetTypes){
            var type = gameAssetTypes[typeIndex];
            //不包含就塞到settings里面去
            if(settings.assetTypes.indexOf(type) == -1){
                settings.assetTypes.push(type);
            }
        }
        //更改资源累心索引，保证合并后的资源类型是正确的
        for (var uuidKey in settings.rawAssets.assets) {
    
            var index = settings.rawAssets.assets[uuidKey][1];
            var type1 = gameAssetTypes[index];
    
            for(var typeIndex in settings.assetTypes){
    
                var type2 = settings.assetTypes[typeIndex];
    
                if(type1 == type2){
                    settings.rawAssets.assets[uuidKey][1] = parseInt(typeIndex);//这边莫名奇妙要 parseInt()一下，否则会报错
                }
            }
    
        }
        /////////////////////////////// end /////////////////////////////////////
    
        for (var assetkey in hallSetting.packedAssets) {
            settings.packedAssets[assetkey] = hallSetting.packedAssets[assetkey];
        }
    
        //动态资源合并
        for (var uuidKey in hallSetting.rawAssets.assets) {
            
            settings.rawAssets.assets[uuidKey] = hallSetting.rawAssets.assets[uuidKey];
        }
    
        //场景合并
        for (var sceneKey in hallSetting.scenes) {
            settings.scenes.push(hallSetting.scenes[sceneKey]);
        }
    
        cc.hall = hallSetting;
        //console.log('cc.hall', JSON.stringify(cc.hall));
    
    
        if ( !settings.debug ) {
            var uuids = settings.uuids;
    
            var rawAssets = settings.rawAssets;
            var assetTypes = settings.assetTypes;
            var realRawAssets = settings.rawAssets = {};
            for (var mount in rawAssets) {
                var entries = rawAssets[mount];
                var realEntries = realRawAssets[mount] = {};
                for (var id in entries) {
                    var entry = entries[id];
                    var type = entry[1];
                    // retrieve minified raw asset
                    if (typeof type === 'number') {
                        entry[1] = assetTypes[type];
                    }
                    // retrieve uuid
                    realEntries[uuids[id] || id] = entry;
                }
            }
    
            var scenes = settings.scenes;
            for (var i = 0; i < scenes.length; ++i) {
                var scene = scenes[i];
                if (typeof scene.uuid === 'number') {
                    scene.uuid = uuids[scene.uuid];
                }
            }
    
            var packedAssets = settings.packedAssets;
            for (var packId in packedAssets) {
                var packedIds = packedAssets[packId];
                for (var j = 0; j < packedIds.length; ++j) {
                    if (typeof packedIds[j] === 'number') {
                        packedIds[j] = uuids[packedIds[j]];
                    }
                }
            }
        }



    if ( !settings.debug ) {
        var uuids = settings.uuids;

        var rawAssets = settings.rawAssets;
        var assetTypes = settings.assetTypes;
        var realRawAssets = settings.rawAssets = {};
        for (var mount in rawAssets) {
            var entries = rawAssets[mount];
            var realEntries = realRawAssets[mount] = {};
            for (var id in entries) {
                var entry = entries[id];
                var type = entry[1];
                // retrieve minified raw asset
                if (typeof type === 'number') {
                    entry[1] = assetTypes[type];
                }
                // retrieve uuid
                realEntries[uuids[id] || id] = entry;
            }
        }

        var scenes = settings.scenes;
        for (var i = 0; i < scenes.length; ++i) {
            var scene = scenes[i];
            if (typeof scene.uuid === 'number') {
                scene.uuid = uuids[scene.uuid];
            }
        }

        var packedAssets = settings.packedAssets;
        for (var packId in packedAssets) {
            var packedIds = packedAssets[packId];
            for (var j = 0; j < packedIds.length; ++j) {
                if (typeof packedIds[j] === 'number') {
                    packedIds[j] = uuids[packedIds[j]];
                }
            }
        }
    }

    var onStart = function () {

        cc.loader.downloader._subpackages = settings.subpackages;

        cc.view.enableRetina(false);
        cc.view.resizeWithBrowserSize(true);


          if (!false && !false) {
            if (cc.sys.isMobile) {
                if (settings.orientation === 'landscape') {
                    cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
                }
                else if (settings.orientation === 'portrait') {
                    cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
                }
                cc.view.enableAutoFullScreen([
                    cc.sys.BROWSER_TYPE_BAIDU,
                    cc.sys.BROWSER_TYPE_WECHAT,
                    cc.sys.BROWSER_TYPE_MOBILE_QQ,
                    cc.sys.BROWSER_TYPE_MIUI,
                ].indexOf(cc.sys.browserType) < 0);
            }

        }


        // init assets
        cc.AssetLibrary.init({
            libraryPath: 'res/import',
            rawAssetsBase: 'res/raw-',
            rawAssets: settings.rawAssets,
            packedAssets: settings.packedAssets,
            md5AssetsMap: settings.md5AssetsMap
        });

       

        var launchScene = settings.launchScene;
        // load scene
        cc.director.loadScene(launchScene, null,
        function () {
            GameMsgServer.sendJoinRoom();
            cc.loader.onProgress = null;
            console.log('Success to load scene: ' + launchScene);
         }
        );


    };

    // jsList
    var jsList = settings.jsList;

    var bundledScript = settings.debug ? 'src/project.dev.js' : 'src/project.js';
    if (jsList) {
        jsList = jsList.map(function (x) {
            return 'src/' + x;
        });
        jsList.push(bundledScript);
    }
    else {
        jsList = [bundledScript];
    }
    
    var option = {
        id: 'GameCanvas',
        scenes: settings.scenes,
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: !false && settings.debug,
        frameRate: 60,
        jsList: jsList,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    }

    cc.game.run(option, onStart);
};

window.boot();