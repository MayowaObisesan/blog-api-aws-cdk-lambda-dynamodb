import { aws_lambda_nodejs, aws_apigateway, aws_dynamodb, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class RestApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new aws_apigateway.RestApi(this, "blogPostApi");
    const table = new aws_dynamodb.Table(this, "blogPostTable", {
      tableName: "blogPostTable",
      partitionKey: { name: "id", type: aws_dynamodb.AttributeType.STRING }, // the Id of our blog post is set as the partition key. It is also the primary key. It is unique as well
    });

    const createBlogPostLambdaName = "createBlogPostHandler";
    const createBlogPostLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      createBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: createBlogPostLambdaName,
        functionName: createBlogPostLambdaName,
        environment: { TABLE_NAME: table.tableName }
      }
    );

    // Grant lambda the access to write to our DynamoDB table
    table.grantWriteData(createBlogPostLambda);

    // Implement Get all endpoint
    const getBlogPostsLambdaName = "getBlogPostsHandler";
    const getBlogPostsLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      getBlogPostsLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: getBlogPostsLambdaName,
        functionName: getBlogPostsLambdaName,
        environment: { TABLE_NAME: table.tableName }
      }
    );
    // Grant lambda access to read from our DynamoDB table
    table.grantReadData(getBlogPostsLambda);

    // Implement Get one Blog Post
    const getBlogPostLambdaName = "getBlogPostHandler";
    const getBlogPostLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      getBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: getBlogPostLambdaName,
        functionName: getBlogPostLambdaName,
        environment: { TABLE_NAME: table.tableName }
      }
    )
    table.grantReadData(getBlogPostLambda);

    // Implement Delete a single Post
    const deleteBlogPostLambdaName = "deleteBlogPostHandler";
    const deleteBlogPostLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      deleteBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: deleteBlogPostLambdaName,
        functionName: deleteBlogPostLambdaName,
        environment: { TABLE_NAME: table.tableName }
      }
    )
    table.grantWriteData(deleteBlogPostLambda);

    // Handle integration of lambda from api_gateway
    // POST https://example.com/blogposts
    const blogPostPath = api.root.addResource("blogaposts");
    blogPostPath.addMethod(
      "POST",
      new aws_apigateway.LambdaIntegration(createBlogPostLambda)
    );
    blogPostPath.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(getBlogPostsLambda),
      {
        requestParameters: {
          "method.request.querystring.order": false,
        }
      }
    );

    // For paths with ID - Single objects.
    const blogPostByIdPath = blogPostPath.addResource("{id}");
    blogPostByIdPath.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(getBlogPostLambda)
    );

    blogPostByIdPath.addMethod(
      "DELETE",
      new aws_apigateway.LambdaIntegration(deleteBlogPostLambda)
    );
  }
}
