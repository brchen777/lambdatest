'use strict';
const moment = require('moment');
const cryptoRandomString = require('crypto-random-string');
const stepFunction = require('./stepFunction');

function successLog() {
    const randomNumStr = cryptoRandomString({ length: 10, type: 'numeric' });
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: 'successLog',
            randomNumStr,
        }),
    };
}

function errorLog() {
    const randomNumStr = cryptoRandomString({ length: 10, type: 'numeric' });
    const randomBase64Str = cryptoRandomString({ length: 10, type: 'base64' });
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: 'triggerStepFunction',
            randomNumStr,
            randomBase64Str,
        }),
    };
}

async function createStepFunction() {
    const randomBase64Str = cryptoRandomString({ length: 10, type: 'base64' });
    const randomRunIdx = Math.floor(Math.random() * 10) + 1;

    const executionArns = [];
    for (let i = 1; i <= randomRunIdx; i++) {
        const { executionArn } = await stepFunction.invoke('helloFunction', { randomBase64Str, i });
        console.log(`randomBase64Str: ${randomBase64Str}, runIndex: ${i}, executionArn: ${executionArn}`);
        executionArns.push(executionArn);
    }
    return {
        statusCode: 201,
        body: JSON.stringify({
            msg: 'createStepFunction',
            randomBase64Str,
            randomRunIdx,
            executionArns,
            time: moment().format(),
        }),
    };
}

async function deleteStepFunction(event) {
    const { arnId } = JSON.parse(event.body);
    const randomBase64Str = cryptoRandomString({ length: 10, type: 'base64' });
    const { stopDate } = await stepFunction.cancelInvoke('helloFunction', arnId);
    console.log(`randomBase64Str: ${randomBase64Str}, stopDate: ${stopDate}`);
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: 'deleteStepFunction',
            randomBase64Str,
            time: moment().format(),
            stopDate,
        }),
    };
}

async function testRestartExecution(event) {
    const randomBase64Str = cryptoRandomString({ length: 10, type: 'base64' });
    const randomRunIdx = Math.floor(Math.random() * 10) + 1;

    const { executionArn } = await stepFunction.invoke('restart', { randomBase64Str });
    return {
        statusCode: 201,
        body: JSON.stringify({
            msg: 'testRestartExecution',
            randomBase64Str,
            randomRunIdx,
            executionArn,
            time: moment().format(),
        }),
    };
}

module.exports = {
    successLog,
    errorLog,
    createStepFunction,
    deleteStepFunction,
    testRestartExecution
};
