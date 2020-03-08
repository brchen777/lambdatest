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
    const { executionArn } = await stepFunction.invoke('helloFunction', { randomBase64Str });
    console.log(`randomBase64Str: ${randomBase64Str}, executionArn: ${executionArn}`);
    return {
        statusCode: 201,
        body: JSON.stringify({
            msg: 'createStepFunction',
            randomBase64Str,
            executionArn,
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

async function iterator(event) {
    let index = event.iterator.index;
    let step = event.iterator.step;
    let count = event.iterator.count;

    index += step;
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: 'iterator',
            result: {
                index,
                step,
                count,
                continue: index < count,
            },
        }),
    };
}

async function restartExecution(event) {
    let stateMachineArn = event.restart.StateMachineArn;
    event.restart.executionCount -= 1;
    event = JSON.stringify(event);
    const result = await stepFunction.startExecution(event, stateMachineArn);
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: 'restart',
            time: moment().format(),
            result,
        }),
    };
}

module.exports = {
    successLog,
    errorLog,
    createStepFunction,
    deleteStepFunction,
    iterator,
    restartExecution,
};
