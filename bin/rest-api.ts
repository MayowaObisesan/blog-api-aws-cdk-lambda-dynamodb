#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RestApiStack } from '../lib/rest-api-stack';

const app = new cdk.App();
// Tell CDK to deploy to the us-east-1
const region = "us-east-1";
const account = "767397825449";

new RestApiStack(app, 'RestApiStack', {
    env: { region: region, account: account },
});
