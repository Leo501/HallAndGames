

/**
 * 1 原理，用子游戏的去包裹大厅的资源和代码，也可以用大厅包裹子游戏的思路
 * 2 中间可能会遇到的一些问题如下：
 * 2.1  之前的这种写法
 *     if (cc && cc.sys.isNative) {
            let hotUpdateSearchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths');
            if (hotUpdateSearchPaths) {
                jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
            }
        }
     换成以下写法
        if (jsb) {
            var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
            if (hotUpdateSearchPaths) {
                jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
            }
        }

 * 2.2 切换子游戏时之前的   require(storagePath + "/src/main.js"); 要改为   window.require(storagePath + "/src/main.js");      //storagePath:子游戏存储路径
   2.3 返回大厅时之前的     require(storagePath + "/src/dating.js"); 要改为   window.require(storagePath + "/src/dating.js");  //storagePath:子游戏存储路径
   2.4 子游戏引用的资源需要预加载一下，否则无法成功引用 （！！！！这个bug 是针对安卓手机的！！！！！）如下：
       1如果引用大厅的 prefab  可以这样处理一下
        var prePath = 'hall/prefabs/Dlgs/';
        var ComPaths   = {
            DlgSetting: prePath + 'DlgSetting'         ,  
            DlgPlayerInfo: prePath + 'DlgPlayerInfo',
            DlgChat: prePath + 'DlgChat',
            DlgWebView: prePath + 'DlgWebView',
            PbVoiceState: prePathGameShares + 'PbVoiceState',
            PbClock: prePathGameShares + 'PbClock',
            PbGoldActionLayer: prePathGameShares + 'PbGoldActionLayer',

        };
        module.exports.initHelper = function( cb ){
            let loaded = 0 ;
            _.each( ComPaths , function( value , key ){
                    CCLoaderHelper.getRes( value , cc.Prefab , function (err, prefab) { 
                    cc.log( '@ PBHelper: <' + key + '> is loaded' );
                    loaded ++ ;
                    if( loaded >= _.size( ComPaths ) ){
                        if( cb ) cb();
                        return ;
                    }
                }); 
            });
        };
        2：如果引用大厅的动态图片比如人物头像可以这样处理：
            var HeadNum = 12;
            const prePathGameShares = 'hall/gameshares/';
            module.exports.initHelper = function (cb){
                let loaded = 0 ;
                for(let i = 0; i < HeadNum; i++){
                    let name = prePathGameShares + 'heads/head_' + i;
                    cc.loader.loadRes(name, cc.SpriteFrame, (err, spriteFrame) => {
                        if (err) {
                            return cc.error(err.message || err);
                        }
                        loaded ++ ;
                        if( loaded >= HeadNum ){
                            if( cb ) cb();
                            return ;
                        }
                    });
                }
 
            }
   2.5 如果当你预加载过大厅的prefab 后，即使能在子游戏里引用大厅的prefab ,但发现报错，问题很可能是你prefab 里有使用skeleton 动画，此时动画也需要预加载，或者尽量不去用动画 
   
   2.6 当你切换子游戏的时候在main.js 里合并 settings.assetTypes 时 ，别忘了 assetTypes 这个数组中资源类型的索引一定要和 大厅的settings.rawAssets.assets 资源的索引 子游戏里settings.rawAssets.assets资源的索引一致
       这个时候就需要你重组 合并后的 settings.assetTypes，不然有些资源在切换子游戏后会某些资源不正常，例如
       
       大厅的 setting 是
        rawAssets: {
            assets: {
                "52/GFrAb9P84BAfywQDVDA": ["hall/JSON/data/BCBMRooms01.json", 0],
                "6eWlAn9VBCTbFbLiWX1zMr": ["hall/audios/Chat/Boy/Chat_0.mp3", 1],
                f9djDJgiZN3o9EEpnFJeYf: ["hall/audios/turnOverAfter.mp3", 1],
                "0cFlRb/BlAZasIea/XxQqR": ["hall/gameshares/dealers/dealer_0", 2, 1],
                "a1G8DY2pJK3qTB9mEu+bbh": ["hall/gameshares/heads/head_9.png", 3],
                "a1GL100sxDZ7F9+Qfw5KWC": ["hall/gameshares/prefabs/PbBadgeView.prefab", 4],
            }
        },
        assetTypes: ["cc.JsonAsset", "cc.AudioClip", "cc.SpriteFrame", "cc.Texture2D", "cc.Prefab"],

      子游戏的 setting 是
        rawAssets: {
            assets: {
                "05GIMY+wtHEqGsMAsnZWZq": ["games/bcbm/audios/com/START_W.mp3", 0],
            }
        },
        assetTypes: ["cc.AudioClip"],

     所以你再合并 大厅和子游戏的 assets 时一定要把对应的 assetTypes 重组一下保证新的 assets里的资源 对应的 assetTypes 类型是对的
       
*/

////////////////////////////以上这些是我做2.0.7的时候踩过的一些坑，可以参考一下////////////////////////////////////////////////////////////////


///////////////////////////缺陷就是大厅的所有资源和代码必须在第一次打开游戏的时候进行一次更新，保证子游戏引用的永远是最新的大厅//////////////////////////////////

// 具体的实现可以看dating.js  和 main.js 

//顺便配上大厅的 settings  和 子游戏的 settings  方便大家理解
 
//大厅的

window._CCSettings = {
	platform: "android",
	groupList: ["default", "Fish", "Bullet"],
	collisionMatrix: [
		[false],
		[false, false, true],
		[false, true, false]
	],
	rawAssets: {
		assets: {
			"52/GFrAb9P84BAfywQDVDA": ["hall/JSON/data/BCBMRooms01.json", 0],
			"f2+ua8PulCI5GlKI4G11FW": ["hall/JSON/data/BJLRooms01.json", 0],
			"7cOfzYZKdIIq7K6oR1sCyo": ["hall/JSON/data/BRNNRooms01.json", 0],
			"1dE3M9U5RHM5gqGhf2Z1aK": ["hall/JSON/data/DDZRooms01.json", 0],
			"b63Ici1mxA0I6wpo9K1Z+j": ["hall/JSON/data/DZRooms01.json", 0],
			a1EUTUcMJNq6UnGTNbuehZ: ["hall/JSON/data/FreeWheel.json", 0],
			a1ECn5ulNFLK3AbkcdlY6l: ["hall/JSON/data/Items.json", 0],
			cbXqhsp1RAN7ADuG5lZRzt: ["hall/JSON/data/LX9Rooms01.json", 0],
			a1ESqetKNCZLrOp8TTKVKC: ["hall/JSON/data/LuckyWheel.json", 0],
			a1GzOClmJITa7YLRc6eDZr: ["hall/JSON/data/PhoneCode.json", 0],
			cb0sNmAuBJQ62uuwZVBmXy: ["hall/JSON/data/RankRewardWfee.json", 0],
			a1Hf4kUPhGWKtLZFtZKSGF: ["hall/JSON/data/YTNNRooms01.json", 0],
			"3fiPOcuLpMDIwYuitixg8L": ["hall/JSON/data/YYBFRooms01.json", 0],
			"523pXYOeRFhJRzSm3Mh+oz": ["hall/JSON/data/ZJHRooms01.json", 0],
			"6eWlAn9VBCTbFbLiWX1zMr": ["hall/audios/Chat/Boy/Chat_0.mp3", 1],
			"49qIgw+NBH5YZvLksnHRMb": ["hall/audios/Chat/Boy/Chat_1.mp3", 1],
			"ac7pSrkmRMnq3Cd+jSN4/d": ["hall/audios/Chat/Boy/Chat_2.mp3", 1],
			"12TdXPUQ9Pi6iHMiUvpq1n": ["hall/audios/Chat/Boy/Chat_3.mp3", 1],
			"56iLTstUVLJolR7iLkroj4": ["hall/audios/Chat/Boy/Chat_4.mp3", 1],
			e2hYiw4oNB37IYZnr1EQFV: ["hall/audios/Chat/Boy/Chat_5.mp3", 1],
			dbZc5AoQBKxq9PYSS2icSt: ["hall/audios/Chat/Boy/Chat_6.mp3", 1],
			d6OGNleZxITIa8jFrsnXgq: ["hall/audios/Chat/Boy/Chat_7.mp3", 1],
			"15NJNIsVBKLY5kB88HnRpP": ["hall/audios/Chat/Boy/Chat_8.mp3", 1],
			"37XteSwmtH0JOYq+phDE4M": ["hall/audios/Chat/Boy/Chat_9.mp3", 1],
			"7eY6qvaoFEcZAJcin3FnBK": ["hall/audios/Chat/Girl/Chat_0.mp3", 1],
			"943nzhBXZFkY8LVbtYwZtD": ["hall/audios/Chat/Girl/Chat_1.mp3", 1],
			"5dWr/MAJRIQrsLuahDcwPx": ["hall/audios/Chat/Girl/Chat_2.mp3", 1],
			"76A0/fpmxBpI3p7eDXIRKe": ["hall/audios/Chat/Girl/Chat_3.mp3", 1],
			"77NYcN3olLUamSyDUOnUrJ": ["hall/audios/Chat/Girl/Chat_4.mp3", 1],
			"7b8DtucL9Mh45jKA/Vs0GP": ["hall/audios/Chat/Girl/Chat_5.mp3", 1],
			"c1ZpLKkaJDXIEddDD/zSw+": ["hall/audios/Chat/Girl/Chat_6.mp3", 1],
			ffJCLUAqZCe52JsXugrfc9: ["hall/audios/Chat/Girl/Chat_7.mp3", 1],
			"13jNSLe0RM1b+tBEZl+OUX": ["hall/audios/Chat/Girl/Chat_8.mp3", 1],
			"db1oWqlP5MybLNu2i+jbRC": ["hall/audios/Chat/Girl/Chat_9.mp3", 1],
			"21ynb3S/hCEJ7+18Wx8brb": ["hall/audios/audio_ui_click.mp3", 1],
			"8bIEt49ipDYJJE84GZfeeW": ["hall/audios/bg.mp3", 1],
			"7ca+tWV6lA7YTi1xBCrg7U": ["hall/audios/bg2.mp3", 1],
			"9dA/yzuDBG+YJHz6PT6Pyo": ["hall/audios/game/bcbm/bg.mp3", 1],
			ddhjQ544VP7IxzP88aVmO2: ["hall/audios/game/bjl/bg.mp3", 1],
			"27YsEuvTlCTJ1rYl7pwn2I": ["hall/audios/game/brnn/bg.mp3", 1],
			"2dtMfRJUJIEoXcie1R9OCp": ["hall/audios/game/ddz/bg.mp3", 1],
			"031RVPFNJH3pXX+lX7v+kX": ["hall/audios/game/dz/bg.mp3", 1],
			"45RFKPsKJN46KHY1qNdINw": ["hall/audios/game/ermj/bg.mp3", 1],
			"752LU00+xENK3H5QGGvieJ": ["hall/audios/game/lkpy/bg.mp3", 1],
			"da6/DvT49Oko9HL8AlUMKZ": ["hall/audios/game/lx9/bg.mp3", 1],
			"5dYbEZiaxNMqlGTZEvjCkx": ["hall/audios/game/nn/bg.mp3", 1],
			c6InoZTb9JUoWTneEr1blr: ["hall/audios/game/yybf/bg.mp3", 1],
			ad8w6AvQxF6qDAfIctNBYV: ["hall/audios/game/zjh/bg.mp3", 1],
			f9djDJgiZN3o9EEpnFJeYf: ["hall/audios/turnOverAfter.mp3", 1],
			"0cFlRb/BlAZasIea/XxQqR": ["hall/gameshares/dealers/dealer_0", 2, 1],
			"6f9j/XES9N5qG5k5p3ZD/g": ["hall/gameshares/dealers/dealer_0.png", 3],
			"03orBieVtN37KfFbxoyqtT": ["hall/gameshares/dealers/dealer_1", 2, 1],
			"eaj/sCPntKBJtBqIrAkzXj": ["hall/gameshares/dealers/dealer_1.png", 3],
			"3bhKDdWtlAAo8d/QfmJubd": ["hall/gameshares/dealers/dealer_2", 2, 1],
			"e4bRJCJc9GI6dntYou+Jcd": ["hall/gameshares/dealers/dealer_2.png", 3],
			"adQdLr+ntIaKMI0iKhlRjJ": ["hall/gameshares/dealers/dealer_3", 2, 1],
			fdR5oxu2tA2IRiUZu8bvGQ: ["hall/gameshares/dealers/dealer_3.png", 3],
			"f18u1CWdhF2YE/vlG3Fdt0": ["hall/gameshares/dealers/dealer_4", 2, 1],
			"f9X+3gmfREaIIL3c2d3QfW": ["hall/gameshares/dealers/dealer_4.png", 3],
			"fbPbSW/tZP9rNVtlZozvU9": ["hall/gameshares/dealers/dealer_5", 2, 1],
			"59t5vYEu9C5LEMe3gluUzG": ["hall/gameshares/dealers/dealer_5.png", 3],
			df68k7ye5LtKoZFUcnDesA: ["hall/gameshares/dealers/dealer_6", 2, 1],
			f9VcUr7xdKo5XGHMwKwNPS: ["hall/gameshares/dealers/dealer_6.png", 3],
			a1GUPA0eNLBZ4bDO5FQffT: ["hall/gameshares/heads/head_0", 2, 1],
			a1Fg7xRPFFjZUMvIyR1api: ["hall/gameshares/heads/head_0.png", 3],
			"a1EYOycFFAaLb8/hRVJ2ex": ["hall/gameshares/heads/head_1", 2, 1],
			a1H2lEjsZC7Zo8kODA0mQJ: ["hall/gameshares/heads/head_1.png", 3],
			"a1EHi+fWtIy4ExCvIYlqnP": ["hall/gameshares/heads/head_10", 2, 1],
			a1HdVWGB1AHpTFmePchBzr: ["hall/gameshares/heads/head_10.png", 3],
			a1E2FnvvNCMKvWtnKKtnSZ: ["hall/gameshares/heads/head_11", 2, 1],
			"a1G4vbxsNG6oRUldV3e8+S": ["hall/gameshares/heads/head_11.png", 3],
			a1EUf9hm5M8LBu7Vwhsfjb: ["hall/gameshares/heads/head_2", 2, 1],
			"a1HI80l+hICaT3B6hUHXMl": ["hall/gameshares/heads/head_2.png", 3],
			"a1F+wyNI5HJptb9BUDI2Xn": ["hall/gameshares/heads/head_3", 2, 1],
			"a1EyoeX85I+or2gi6W0g8/": ["hall/gameshares/heads/head_3.png", 3],
			"a1HLv3urZLM7aUPuMLdsc/": ["hall/gameshares/heads/head_4", 2, 1],
			a1FPf9ihxIH4vqrM3SdEm5: ["hall/gameshares/heads/head_4.png", 3],
			a1FYPLGMBGsLQdrNIEsDGc: ["hall/gameshares/heads/head_5", 2, 1],
			a1EqCwqlhAV7zNVovbSBaB: ["hall/gameshares/heads/head_5.png", 3],
			a1E3N0CvNNwoWUzhL7ReSM: ["hall/gameshares/heads/head_6", 2, 1],
			a1GKTjJlxAqrQnG0lwbZU5: ["hall/gameshares/heads/head_6.png", 3],
			"a1GC2lEDNEMb+U7yqVNtwQ": ["hall/gameshares/heads/head_7", 2, 1],
			a1E5TiBiNGQY0avTjLcqtb: ["hall/gameshares/heads/head_7.png", 3],
			a1FqaJOBxJmIXjAokXaYMi: ["hall/gameshares/heads/head_8", 2, 1],
			"a1HuuF87hLX7R/Ei1urZOi": ["hall/gameshares/heads/head_8.png", 3],
			a1EYaqBA1LtqIBgOOuqnrV: ["hall/gameshares/heads/head_9", 2, 1],
			"a1G8DY2pJK3qTB9mEu+bbh": ["hall/gameshares/heads/head_9.png", 3],
			"a1GL100sxDZ7F9+Qfw5KWC": ["hall/gameshares/prefabs/PbBadgeView.prefab", 4],
			"22JFc0prBPTIhKp9e9TEt3": ["hall/gameshares/prefabs/PbClock.prefab", 4],
			"9fu5y5DjNMdoBEVpomCPZ6": ["hall/gameshares/prefabs/PbGoldActionLayer.prefab", 4],
			a1NItIlSdOyLzyb0gYkJoQ: ["hall/gameshares/prefabs/PbVoiceState.prefab", 4],
			"29qc4A9TJARaAG9zwXfJU4": ["hall/gameshares/tables/table_0", 2, 1],
			"f2/6Tr9blDf6Tanko6IPmf": ["hall/gameshares/tables/table_0.png", 3],
			f5enKRGDVOI5srgIk0lhC7: ["hall/gameshares/tables/table_1", 2, 1],
			"4dowx15YtIGL7MQ/S3yi/y": ["hall/gameshares/tables/table_1.png", 3],
			"90JBo6InxAvp9jhACqyUg9": ["hall/gameshares/tables/table_2", 2, 1],
			ddE0tjhqZA6YTNszoemq3e: ["hall/gameshares/tables/table_2.png", 3],
			"8fpoz4iz1GnqAm4wjpIcBn": ["hall/gameshares/tables/table_3", 2, 1],
			"f22da+v5JHU4y3fJYiZhCr": ["hall/gameshares/tables/table_3.png", 3],
			"a1NLwDCq1P/4PZe9/jQ6/K": ["hall/gameshares/tables/table_bg", 2, 1],
			a1Ouzjau1AmL4IKlEcDTPN: ["hall/gameshares/tables/table_bg.png", 3],
			a2x10OfXZNmKZcKNvJe2hB: ["hall/gameshares/tables/table_bg1", 2, 1],
			"43aNfOBvNNPZ8nPGyTH2QF": ["hall/gameshares/tables/table_bg1.png", 3],
			e4A9PmOldLKIAO8vtC8WTN: ["hall/prefabs/Dlgs/DlgAccountSignIn.prefab", 4],
			"32fsiIXzNCU5kelFLoGQ/B": ["hall/prefabs/Dlgs/DlgBankCard.prefab", 4],
			b5I4aZPgRIErEjgpg2nPmU: ["hall/prefabs/Dlgs/DlgBankPop_up.prefab", 4],
			b95pXDb5JMRpIATUCn8msR: ["hall/prefabs/Dlgs/DlgBindAccount.prefab", 4],
			"67OuVjIbxGUZMrKA7xpVhZ": ["hall/prefabs/Dlgs/DlgBindAccountBank.prefab", 4],
			b4DoR73KhGa5BF1MtEagMz: ["hall/prefabs/Dlgs/DlgBindBankCard.prefab", 4],
			a1FeV0I8pOuacqJp9YTgMQ: ["hall/prefabs/Dlgs/DlgBindPhone.prefab", 4],
			"31SjpR5EZLDrCe2kSAem4m": ["hall/prefabs/Dlgs/DlgBindofGold.prefab", 4],
			a1HoffEdtPMJiPBLs2OBak: ["hall/prefabs/Dlgs/DlgBuyCard.prefab", 4],
			"97Y9nK+zNMiq5sfc6SmCto": ["hall/prefabs/Dlgs/DlgChangeBankPassword.prefab", 4],
			"62j1NNvmZLPY9ElcvILZZg": ["hall/prefabs/Dlgs/DlgChangePassword.prefab", 4],
			a1Gd4bJhJFl5uxR4SrrFwo: ["hall/prefabs/Dlgs/DlgCharge.prefab", 4],
			a1Fm0rda9IUa9W5QjWY0Mg: ["hall/prefabs/Dlgs/DlgChat.prefab", 4],
			"2eKzulXwNFBLLOARh81lUe": ["hall/prefabs/Dlgs/DlgChat2.prefab", 4],
			a1EsUTywdE5a8yNEDv7zE1: ["hall/prefabs/Dlgs/DlgCheckCode.prefab", 4],
			a1F109VXZMuYJvrJzX5vbI: ["hall/prefabs/Dlgs/DlgCreateRoom.prefab", 4],
			"018pHY3wJLepCvq4pSmd1Y": ["hall/prefabs/Dlgs/DlgExchange.prefab", 4],
			"06DlTkA2dOQZEQ+SvR9wU4": ["hall/prefabs/Dlgs/DlgFeedBack.prefab", 4],
			"22NfZ7tgtJvrubXzS5uEc4": ["hall/prefabs/Dlgs/DlgGameNeedDownload.prefab", 4],
			"7fiQUQCuNBWK0oZnDstDB7": ["hall/prefabs/Dlgs/DlgGetCandy.prefab", 4],
			"a1G7k+J3ZLYaQofgefsi7Z": ["hall/prefabs/Dlgs/DlgGetItems.prefab", 4],
			"a1GxjFRZVC/I8nCkN4S6sl": ["hall/prefabs/Dlgs/DlgGiveDiamonds.prefab", 4],
			a1GkGbdTBAc6HBnlZWa0CZ: ["hall/prefabs/Dlgs/DlgGiveDiamondsHistory.prefab", 4],
			a1Gkbxp4BAX7BHvQNwIS1G: ["hall/prefabs/Dlgs/DlgHeads.prefab", 4],
			a1GKzKMTtGp68xFjpUKX80: ["hall/prefabs/Dlgs/DlgHelp.prefab", 4],
			a1FQR1B0BKkp7v9ArcGimm: ["hall/prefabs/Dlgs/DlgHistory.prefab", 4],
			a1FDanixZPd7K55UvE0fZr: ["hall/prefabs/Dlgs/DlgInvitationDetails.prefab", 4],
			"a1HVhjogVIOo4T1tJ/XjSW": ["hall/prefabs/Dlgs/DlgInviteBind.prefab", 4],
			"a1ENM+eGRBGaecSR+Oz49P": ["hall/prefabs/Dlgs/DlgJoinRoom.prefab", 4],
			"a1GDJN2ktErYE8H+pVHxGB": ["hall/prefabs/Dlgs/DlgJoinRoom2.prefab", 4],
			a1FIh4m6VJbZYA5FISJP8h: ["hall/prefabs/Dlgs/DlgLuckyWheel.prefab", 4],
			"a1E2Wl8INO27Gq//10ZM2s": ["hall/prefabs/Dlgs/DlgMails.prefab", 4],
			"a1GhTfi5JN+I1grYGKCI6E": ["hall/prefabs/Dlgs/DlgMyWallet.prefab", 4],
			"a1G6iHNB1AUpKl/tPGUH1H": ["hall/prefabs/Dlgs/DlgNotice2.prefab", 4],
			a1Ey4qzadMKa0QPLwaFCmV: ["hall/prefabs/Dlgs/DlgNotice3.prefab", 4],
			"273S8KGvdJpLWw0zGjuB2s": ["hall/prefabs/Dlgs/DlgOfficialRecharge.prefab", 4],
			a1GNKUC4ZKXbTsLmYCVYIA: ["hall/prefabs/Dlgs/DlgPhoneRegister.prefab", 4],
			a1FWNS1ItEq5K28j09AQ1u: ["hall/prefabs/Dlgs/DlgPlayerInfo.prefab", 4],
			e25CBHVT5EEZrsYIoJM1Fz: ["hall/prefabs/Dlgs/DlgPlayerInfoNew.prefab", 4],
			f3mgwpfbxEp59vHIVYWKaw: ["hall/prefabs/Dlgs/DlgPresent.prefab", 4],
			"2ePI/IBEBFPJxSSEKaJdW7": ["hall/prefabs/Dlgs/DlgProperty.prefab", 4],
			"89DQhEOP9JypP9DAhMnPbP": ["hall/prefabs/Dlgs/DlgPublicNotice.prefab", 4],
			"99998W2ONJyJSfbUn/LpDl": ["hall/prefabs/Dlgs/DlgRankRewardMain.prefab", 4],
			"70viz2fPxH+K7NZ1ghRv70": ["hall/prefabs/Dlgs/DlgReConnect.prefab", 4],
			"325B8t2bhEyY6iYq5U8Ko0": ["hall/prefabs/Dlgs/DlgRechargeRecord.prefab", 4],
			"48r3NrYCZCeqTEBUKUFmKr": ["hall/prefabs/Dlgs/DlgRechargeTips.prefab", 4],
			db37XG3vVNn4o5gSyrLQnU: ["hall/prefabs/Dlgs/DlgReport.prefab", 4],
			f80t66wRBC3ZMMJlazW9nI: ["hall/prefabs/Dlgs/DlgRevisePasswoedNc.prefab", 4],
			a1G11L9iZMHLZfAQVRKLqw: ["hall/prefabs/Dlgs/DlgRevisePassword.prefab", 4],
			a1EIECddRPrKqHjulWfV8B: ["hall/prefabs/Dlgs/DlgService.prefab", 4],
			a1FaK4F1NBQaT0aIYxnBFA: ["hall/prefabs/Dlgs/DlgSetting.prefab", 4],
			a1ESchKm5EvbgxW5hmS91X: ["hall/prefabs/Dlgs/DlgShare.prefab", 4],
			a1FIc8riFJWKRbIM2Xg3l6: ["hall/prefabs/Dlgs/DlgShare2.prefab", 4],
			c3Z81PjzRPZ64fPvCyQ9MQ: ["hall/prefabs/Dlgs/DlgShareCode.prefab", 4],
			"35N1q1SLFH7KMpy/vZi56Q": ["hall/prefabs/Dlgs/DlgShareOut.prefab", 4],
			"f7ftMIz7NErZGwM+vMoVoC": ["hall/prefabs/Dlgs/DlgShareOutDetail.prefab", 4],
			"9aSNlesetMmod+W+ly6KsC": ["hall/prefabs/Dlgs/DlgShareOutHistory.prefab", 4],
			"9d6Dt0Vw5KzqLC1erOwSEL": ["hall/prefabs/Dlgs/DlgShareOutHistoryDetail.prefab", 4],
			"a1FRj+zBNNg6iiGnxrmK5p": ["hall/prefabs/Dlgs/DlgShareSpecQR.prefab", 4],
			fb0j75OX9OopBQPqKH7L1E: ["hall/prefabs/Dlgs/DlgShop.prefab", 4],
			b16zbNjv5F96KYivXFcmZL: ["hall/prefabs/Dlgs/DlgTime.prefab", 4],
			"a1F/PT7uBHt7+OqXptpnjq": ["hall/prefabs/Dlgs/DlgViewRoom.prefab", 4],
			"67iD7M8NhPJJf60IFApAld": ["hall/prefabs/Dlgs/DlgVipRechagre.prefab", 4],
			a1Ht83xrZBy4I5fkNf1o1N: ["hall/prefabs/Dlgs/DlgWalletConvert.prefab", 4],
			"15AiLm+PBAPqeBGv2NOjO/": ["hall/prefabs/Dlgs/DlgWalletOut.prefab", 4],
			"a1EH0N+NRBd7hNkGwLZvRx": ["hall/prefabs/Dlgs/DlgWalletRecharge.prefab", 4],
			a1ELipSd1PWoLAYeIMvFhu: ["hall/prefabs/Dlgs/DlgWalletRecordAll.prefab", 4],
			a1H9nShKdBJKTmqnQ5fyiM: ["hall/prefabs/Dlgs/DlgWalletRecordIn.prefab", 4],
			a1FWqgWjBK2Jt5UOJsjfAw: ["hall/prefabs/Dlgs/DlgWalletRecordOut.prefab", 4],
			a1FTDpXEJNTrj2aX2JduNd: ["hall/prefabs/Dlgs/DlgWalletToEth.prefab", 4],
			"a1H/OPohRMPbXx9qDUOwc5": ["hall/prefabs/Dlgs/DlgWalletWithdraw.prefab", 4],
			"56CKOrQihCs4bs8sRely6m": ["hall/prefabs/Dlgs/DlgWebRecharge.prefab", 4],
			a1H16Ha19Ex4phxkDYqFIk: ["hall/prefabs/Dlgs/DlgWebView.prefab", 4],
			fbo429b4pCJaZ0I7Z9QK5W: ["hall/prefabs/Dlgs/DlgWebViewService.prefab", 4],
			"9eRMmgskpM5ryLKnFExX+/": ["hall/prefabs/Dlgs/DlgYrBw.prefab", 4],
			"665O3BM39EOr2dIhX8YEWD": ["hall/prefabs/NodePools/ComChatSF.prefab", 4],
			"1ap1XHU29NG6SryP0A56v5": ["hall/prefabs/NodePools/PbBulletScreen.prefab", 4],
			a1HjKmGfdJ4bmZMAG8D2w8: ["hall/prefabs/NodePools/pbCard.prefab", 4],
			"4dXAuoZONCm7yBlTxCuv6T": ["hall/prefabs/NodePools/pbHeadLoading.prefab", 4],
			a1HMXOAOlIFKTV6klDYove: ["hall/prefabs/NodePools/pbLoading.prefab", 4],
			a1EeUdkwJEZ7v8ItVwarMC: ["hall/prefabs/NodePools/pbToast.prefab", 4],
			a1ERl9IINLeLNU0GKkxYOA: ["hall/prefabs/NodePools/pbTopInfo.prefab", 4],
			a1Gs6DnpRFOpKbqU4L3x5M: ["hall/prefabs/NodePools/pbTouchMask.prefab", 4]
		}
	},
	assetTypes: ["cc.JsonAsset", "cc.AudioClip", "cc.SpriteFrame", "cc.Texture2D", "cc.Prefab"],
	launchScene: "db://assets/hall/scenes/LoadingScene.fire",
	scenes: [{
		url: "db://assets/hall/scenes/LoadingScene.fire",
		uuid: "a1Hrj6Lb5MEapvpX2cXvCo"
	}, {
		url: "db://assets/hall/hallscene/BJLHallScene.fire",
		uuid: "0210Wo5f9BTZi0/MvzLY4T"
	}, {
		url: "db://assets/hall/hallscene/BRNNHallScene.fire",
		uuid: "64bIz63iNGJYmr/gwm2FQe"
	}, {
		url: "db://assets/hall/hallscene/ByHallScene.fire",
		uuid: "6dNHmR28ZGZLswejUIFS5n"
	}, {
		url: "db://assets/hall/hallscene/DDZHallScene.fire",
		uuid: "84GUazzxlE64QnjaBmtkIi"
	}, {
		url: "db://assets/hall/hallscene/DZHallScene.fire",
		uuid: "c31dJRSyZIVI4m0JHEHnYH"
	}, {
		url: "db://assets/hall/hallscene/ERMJHallScene.fire",
		uuid: "daHj2ui1tICLZ3a1SuaUM6"
	}, {
		url: "db://assets/hall/hallscene/LX9HallScene.fire",
		uuid: "6bsmqiB9JF86sTAWneY9JU"
	}, {
		url: "db://assets/hall/hallscene/NNHallScene.fire",
		uuid: "1aKgZHa4ZGXbw6rFv2mgKe"
	}, {
		url: "db://assets/hall/hallscene/StreetHallScene.fire",
		uuid: "b6EYMl0ahBvZVoYPtkFGTR"
	}, {
		url: "db://assets/hall/hallscene/ZJHHallScene.fire",
		uuid: "13oQr0T6hMC4lQqR+6c1J5"
	}, {
		url: "db://assets/hall/scenes/ChooseGame.fire",
		uuid: "a1EkHjzSZFCKo9lKDrM2cg"
	}, {
		url: "db://assets/hall/hallscene/BCBMHallScene.fire",
		uuid: "d1IHBKAARCt5EDMl085RSe"
	}, {
		url: "db://assets/hall/scenes/LoginScene.fire",
		uuid: "1cRJk0klNPNprj3Vfg+h2x"
	}, {
		url: "db://assets/hall/scenes/PreBackScene.fire",
		uuid: "b6a6Zt+x9GK53erD/cW4aC"
	}, {
		url: "db://assets/hall/scenes/PreLoadingScene.fire",
		uuid: "23uAOFZH1AZo2QmvynhWJf"
	}],
	packedAssets: {},
	md5AssetsMap: {},
	orientation: "",
	subpackages: {},
	uuids: []
};

//子游戏的 

window._CCSettings = {
	platform: "android",
	groupList: ["default"],
	collisionMatrix: [
		[true]
	],
	rawAssets: {
		assets: {
			"05GIMY+wtHEqGsMAsnZWZq": ["games/bcbm/audios/com/START_W.mp3", 0],
			"1aOYMs8zNAt7LQTM9igkae": ["games/bcbm/audios/com/STOP_W.mp3", 0],
			"51gVxmvS5Kab9mbwPt1i7j": ["games/bcbm/audios/com/alert.mp3", 0],
			"03lk5GVetAxoG8DkgxGSqu": ["games/bcbm/audios/com/bcbm_bg.mp3", 0],
			"19Qz3FRBBLbp7P/Lke9zHL": ["games/bcbm/audios/com/bcbm_bg1.mp3", 0],
			e54WR8k9dIxq47VRbku6PC: ["games/bcbm/audios/com/bcbm_bg2.mp3", 0],
			"2edGEHGYtIvJwm3FApHf4L": ["games/bcbm/audios/com/bcbm_bg3.mp3", 0],
			"93bVlgAFVO1I5W/QT+fZTu": ["games/bcbm/audios/com/bcbm_end.mp3", 0],
			"e0AtPH0ZpM75YGuCxsps+r": ["games/bcbm/audios/com/bcbm_run_321.mp3", 0],
			"acUVi2hkdIK77buCr/Jls1": ["games/bcbm/audios/com/bcbm_run_begin.mp3", 0],
			"deU/sTeuFBB67RjQ/wT/Jg": ["games/bcbm/audios/com/bcbm_run_loop.mp3", 0],
			"17gevhrmtI+JqChidn1vGP": ["games/bcbm/audios/com/bcbm_score.mp3", 0],
			"213bLq6IdMI5HMZ9LOQo+7": ["games/bcbm/audios/com/bcbm_start.mp3", 0],
			"adEb5Zp3ZM1o+nXy+GWBM/": ["games/bcbm/audios/com/check.mp3", 0],
			a61ZPtx4pOn4F8FKfVV9zD: ["games/bcbm/audios/com/desk_allin_chip.mp3", 0],
			e7bjJocXRGNa8rjdrf4hn4: ["games/bcbm/audios/com/desk_flip_card.mp3", 0],
			"45964uvxBI1IF0tcAGllyd": ["games/bcbm/audios/com/desk_new_card.mp3", 0],
			a2cf0mljpNXJe3A4hPL8gc: ["games/bcbm/audios/com/desk_player_reminder.mp3", 0],
			"c3/53nTTNMMozY0KYx8W7u": ["games/bcbm/audios/com/desk_post_bet.mp3", 0],
			"26i01p/qpGKbVy1a7ffr/t": ["games/bcbm/audios/com/dispatch.mp3", 0],
			"2ebVgOy7FAELQ7gn1qx3mU": ["games/bcbm/audios/com/getChips.mp3", 0],
			faner4RT9IHqfCIPQ6efgW: ["games/bcbm/audios/com/lose.mp3", 0],
			edV9HjQeNL7pJLnlBfPupO: ["games/bcbm/audios/com/pushCard.mp3", 0],
			feJLsn0cxAip2DanOWTj0O: ["games/bcbm/audios/com/win.mp3", 0]
		}
	},
	assetTypes: ["cc.AudioClip"],
	launchScene: "db://assets/games/bcbm/GameScene_BCBM.fire",
	scenes: [{
		url: "db://assets/games/bcbm/GameScene_BCBM.fire",
		uuid: "a1asjHczpErqOGuhuJKynp"
	}],
	packedAssets: {},
	md5AssetsMap: {},
	orientation: "",
	subpackages: {},
	uuids: []
};
