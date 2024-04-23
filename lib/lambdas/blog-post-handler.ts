import { APIGatewayEvent } from "aws-lambda";
import { APIGatewayClient, GetExportCommand } from "@aws-sdk/client-api-gateway";
import { v4 as uuid } from "uuid";
import { BlogPost } from "./blogPost";
import { BlogPostService } from "./blogPostService";

// APIGatewayEvent = 
// used to represent the event object passed 
// to a lambda function when triggered by an API gateway.

const TABLE_NAME = process.env.TABLE_NAME!;
const blogPostService = new BlogPostService(TABLE_NAME);

export const createBlogPostHandler = async (event: APIGatewayEvent) => {
    const partialBlogPost = JSON.parse(event.body!) as {
        title: string;
        author: string;
        content: string;
    }

    const _id = uuid();
    const _createdAt = new Date().toISOString();
    const blogPost: BlogPost = {
        id: _id,
        title: partialBlogPost.title,
        author: partialBlogPost.author,
        content: partialBlogPost.content,
        createdAt: _createdAt,
    };
    await blogPostService.saveBlogPost(blogPost);

    return {
        statusCode: 201,
        body: JSON.stringify(blogPost),
    };
};

export const getBlogPostsHandler = async (event: APIGatewayEvent) => {
    // handler queryParameter fetching if it exists.
    const _order = event?.queryStringParameters?.order;

    let _blogPosts = await blogPostService.getAllBlogPosts();
    if (_order === "asc") {
        // ASCENDING ORDER
        _blogPosts = _blogPosts.sort((_blogPostsA, _blogPostsB) => _blogPostsA.createdAt.localeCompare(_blogPostsB.createdAt));
    } else {
        // DESCENDING ORDER
        _blogPosts = _blogPosts.sort((_blogPostsA, _blogPostsB) => _blogPostsB.createdAt.localeCompare(_blogPostsA.createdAt));
    }

    return {
        statusCode: 200,
        body: JSON.stringify(_blogPosts),
    };
};

export const getBlogPostHandler = async (event: APIGatewayEvent) => {
    const id = event.pathParameters!.id!;
    const _blogPost = await blogPostService.getBlogPostById(id);

    return {
        statusCode: 200,
        body: JSON.stringify(_blogPost),
    };
};

export const deleteBlogPostHandler = async (event: APIGatewayEvent) => {
    const id = event.pathParameters!.id!;
    await blogPostService.deleteBlogPostById(id);

    return {
        statusCode: 204,
    };
};

export const apiDocsHandler = async (event: APIGatewayEvent) => {
    // The _ui is used for optional loading of the swagger UI. 
    // You could make the UI the default view if your use-case demands it.
    const _ui = event?.queryStringParameters?.ui;
    const _apiGateway = new APIGatewayClient({});
    const restApiId = process.env.API_ID!;  // coming from the environment in the lambda definition in `rest-api-stack` file
    const getExportCommand = new GetExportCommand({
        restApiId: restApiId,
        exportType: "swagger",
        accepts: "application/json",
        stageName: "prod",
    });

    const api = await _apiGateway.send(getExportCommand);
    const response = Buffer.from(api.body!).toString("utf-8");

    if (!_ui) {
        return {
            statusCode: 200,
            body: response,
        }
    }

    const _html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="SwaggerUI" />
      <title>SwaggerUI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: 'api-docs',
          dom_id: '#swagger-ui',
        });
      };
    </script>
    </body>
    </html>`

    return {
        statusCode: 200,
        body: _html,
        headers: {
            "Content-Type": "text/html",
        },
    };
};