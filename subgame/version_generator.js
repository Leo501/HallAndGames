var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var games = 'subgame';
var CUHTTP = 'http://192.168.0.133/down/remote-assets/' + games + '/';


function fsExistsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}

if (fsExistsSync('./test.txt')) {
    var shujuda = (parseFloat(fs.readFileSync('./test.txt', 'utf8')));
    shujuda += 0.01;
} else {
    shujuda = Date.now();
}

shujuda = shujuda.toFixed(2);

if (isNaN(shujuda)) {

    shujuda = Date.now();
}

fs.writeFile('./test.txt', shujuda, function (err) {
    if (err) throw err;
    //console.log('has finished');
});




if (process.argv && process.argv['2']) {
    console.log("Game " + process.argv['2']);
    games = process.argv['2'];
}

console.log("Ver: " + shujuda);

var manifest = {
    packageUrl: CUHTTP,
    remoteManifestUrl: CUHTTP + 'peision.manifest',
    remoteVersionUrl: CUHTTP + 'version.manifest',
    version: shujuda,
    assets: {},
    searchPaths: []
};


var dest = './build/jsb-link';
var src = './build/jsb-link';
var LUJIN = process.cwd() + "/" + src;



function readDir(dir, obj) {
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = fs.readdirSync(dir),
        subpath, size, md5, compressed, relative;

    for (var i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = path.join(dir, subpaths[i]);
        console.log('subpaths=', subpath);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDir(subpath, obj);
        } else if (stat.isFile()) {
            // Size in Bytes
            size = stat['size'];
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(src, subpath);
            relative = encodeURI(relative);
            relative = relative.replace(/%5C/g, "/");
            obj[relative] = {
                'size': size,
                'md5': md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}

var mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
};

// Iterate res and src folder
readDir(path.join(src, 'src'), manifest.assets);
readDir(path.join(src, 'res'), manifest.assets);

var destManifest = path.join(dest, 'peision.manifest');
var destVersion = path.join(dest, 'version.manifest');

mkdirSync(dest);

fs.writeFile(destManifest, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Manifest successfully generated');
});

delete manifest.assets;
delete manifest.searchPaths;
fs.writeFile(destVersion, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Version successfully generated');
});

dest

/*
var exec = require('child_process').exec; 
var cmdStr = 'zip -q -m -o a.zip '+LUJIN+'/res/';
exec(cmdStr, function(err,stdout,stderr){
    if(err) {
        console.log('get weather api error:'+stderr);
    } else {
       console.log('ok');
    }
});
*/