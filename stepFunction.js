const AWS = require('aws-sdk');
const config = require('./serverless.config.dev.json');

class StepFunctionInvoker {
    constructor() {
        this.region = config.REGION;
        this.stepFunctions = new AWS.StepFunctions({
            region: this.region,
        });
    }

    getAccountId() {
        if (this.accountId !== undefined) return this.accountId;
        return new AWS.STS()
            .getCallerIdentity({})
            .promise()
            .then(data => {
                this.accountId = data.Account;
                return this.accountId;
            });
    }

    async getStepFunctionArn(stepFunctionName) {
        const accountId = await this.getAccountId();
        return `arn:aws:states:${this.region}:${accountId}:stateMachine:${stepFunctionName}`;
    }

    async getExecutionStepFunctionArn(stepFunctionName, arnId) {
        const accountId = await this.getAccountId();
        return `arn:aws:states:${this.region}:${accountId}:execution:${stepFunctionName}:${arnId}`;
    }

    invoke(stepFunctionName, data) {
        return this.getStepFunctionArn(stepFunctionName)
            .then(arn => ({
                stateMachineArn: arn,
                input: JSON.stringify(data),
            }))
            .then(params => this.stepFunctions.startExecution(params).promise())
            .catch((error) => {
                console.log(error);
            });
    }

    cancelInvoke(stepFunctionName, arnId) {
        return this.getExecutionStepFunctionArn(stepFunctionName, arnId)
            .then(arn => {
                console.log(`arn: ${arn}`);
                return {
                    executionArn: arn,
                    error: '1005',
                    cause: '手動取消',
                };
            })
            .then(params => this.stepFunctions.stopExecution(params).promise());
    }

    startExecution(event, stateMachineArn) {
        let params = {
            input: event,
            stateMachineArn,
        };
        return this.stepFunctions.startExecution(params).promise();
    }
}

module.exports = new StepFunctionInvoker();
