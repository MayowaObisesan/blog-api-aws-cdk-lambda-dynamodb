#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RestApiStack } from '../lib/rest-api-stack';

const app = new cdk.App();
// Tell CDK to deploy to the us-east-1
const region = "us-east-1"; // feel free to modify this as you want
const account = "767397825449"; // Change this to your AWS account's ID. It can be gotten from the profile dropdown on the top-right of the AWS dashboard console

new RestApiStack(app, 'RestApiStack', {
    env: { region: region, account: account },
});
