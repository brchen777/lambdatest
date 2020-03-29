"use strict";
const stepFunction = require('./stepFunction');
const aws = require('aws-sdk');
const sfn = new aws.StepFunctions();

function printHello(event) {
    const { randomBase64Str } = event;
    console.log(JSON.stringify({ msg: "printHello", randomBase64Str }));
    return randomBase64Str;
}

function iterator(event, context, callback) {
    console.log('event:', event);
    let { index, step, count } = event.iterator;

    index += step;
    const result = { index, step, count, continue: index < count };
    console.log('result:', result);
    callback(null, result);
}

async function restartExecution(event, context, callback) {
    let stateMachineArn = event.restart.StateMachineArn;
    event.restart.executionCount -= 1;
    event = JSON.stringify(event);

    // TODO: 看能不能 refactor
    let params = {
        input: event,
        stateMachineArn: StateMachineArn
    };

    sfn.startExecution(params, function(err, data) {
        if (err) callback(err);
        else callback(null,event);
    });

    // TODO: 待釐清
    // const result = await stepFunction.startExecution(event, stateMachineArn);
    // return {
    //     statusCode: 201,
    //     body: JSON.stringify({ result }),
    // };
}

module.exports = {
    printHello,
    iterator,
    restartExecution
};
