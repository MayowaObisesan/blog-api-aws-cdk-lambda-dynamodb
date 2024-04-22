import { APIGatewayEvent } from "aws-lambda";
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