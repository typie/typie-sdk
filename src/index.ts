
import AbstractHastePackage from "./AbstractHastePackage";
import HasteRowItem from "./models/HasteRowItem";
import SearchObject from "./models/SearchObject";
import GoDispatcher from "./GoDispatcher";
import Haste from "./Haste";

export {
    AbstractHastePackage,
    HasteRowItem,
    GoDispatcher,
    Haste,
    SearchObject,
    getPath
};

const isDev = require('electron-is-dev');
let getPath = function(staticPath) {
    console.error('isDevelopment', isDev);
    if (!isDev) {
        return '../static/' + staticPath;
    } else {
        return staticPath;
    }
};
