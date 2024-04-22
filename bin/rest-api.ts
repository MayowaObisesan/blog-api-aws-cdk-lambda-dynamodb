#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RestApiStack } from '../lib/rest-api-stack';

const app = new cdk.App();
new RestApiStack(app, 'RestApiStack');
