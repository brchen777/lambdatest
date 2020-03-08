"use strict";

function printHello(event) {
    const { randomBase64Str } = event;
    console.log(JSON.stringify({ msg: "printHello", randomBase64Str }));
    return randomBase64Str;
}

module.exports = {
    printHello
};
