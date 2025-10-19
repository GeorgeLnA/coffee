import { RequestHandler } from "express";
import { readItems, readItem } from "@directus/sdk";
import directusClient from "../lib/directus";

// Get all posts
export const getPosts: RequestHandler = async (req, res) => {
  try {
    const posts = await directusClient.request(
      readItems('posts', {
        filter: {
          status: { _eq: 'published' }
        },
        sort: ['-date_created'],
        limit: parseInt(req.query.limit as string) || 10,
        fields: ['*']
      })
    );

    res.json({ success: true, data: posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch posts' 
    });
  }
};

// Get single post by slug
export const getPostBySlug: RequestHandler = async (req, res) => {
  try {
    const { slug } = req.params;

    const posts = await directusClient.request(
      readItems('posts', {
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        limit: 1
      })
    );

    if (!posts || posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Post not found' 
      });
    }

    res.json({ success: true, data: posts[0] });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch post' 
    });
  }
};

