
import AbstractTypiePackage from "./AbstractTypiePackage";
import AppGlobal from "./AppGlobal";
import GoDispatcher from "./GoDispatcher";
import SearchObject from "./models/SearchObject";
import TypieRowItem from "./models/TypieRowItem";
import Typie from "./Typie";

export {
    AbstractTypiePackage,
    AppGlobal,
    getPath,
    GoDispatcher,
    Typie,
    TypieRowItem,
    SearchObject,
};

import * as isDev from "electron-is-dev";
const getPath = (staticPath) => {
    if (!isDev) {
        return "../static/" + staticPath;
    } else {
        return staticPath;
    }
};
