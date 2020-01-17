# HallAndGames

#大厅+子游戏模式

1.x参考文章
http://forum.cocos.com/t/topic/53115
https://forum.cocos.com/t/1-5-2-demo/48200/16
注意 
https://forum.cocos.com/t/require-setting-js/68351

2.x参考文章
https://forum.cocos.com/t/creator-2-0-7/73381
有问题可以加群：822735145

步骤
* 修改hall与subgame中远程热更新地址
* 用Cocos Creator打开工程subgame 点击构建发布(如果使用加密js 请修改密钥成hall所生成的密钥)
* subgame构建完成后。请把subgame目录下的dating.js与main.js放到bulid所在对应模板如jsb-link or jsb-default 下的src目录下。
* 复制两个文件后。开始到subgame目录下。使用version_generator.js 生成热更新文件
* 生成热更新文件后。进入build\jsb-link or build\jsb-default。把目录res与src 跟文件peision.manifest还有version.manifest放到远程目录。
* 用Cocos Creator打开工程hall 点击构建发布生成apk。就可以测试了 

# 分包模式
### 分离出大厅和子游戏的资源并分离
* 参考文章
https://forum.cocos.org/t/topic/74339
github https://github.com/zPiggy/subpackage-tools

### assets-bundle插件基于官方的分包策略。
* 参考文章
https://forum.cocos.org/t/cocoscreator-assetsbundle/88349
github https://github.com/zPiggy/assets-bundle
