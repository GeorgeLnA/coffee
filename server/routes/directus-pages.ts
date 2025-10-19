import { RequestHandler } from "express";
import { readItems } from "@directus/sdk";
import directusClient from "../lib/directus";

// Get all pages
export const getPages: RequestHandler = async (req, res) => {
  try {
    const pages = await directusClient.request(
      readItems('pages', {
        filter: {
          status: { _eq: 'published' }
        },
        sort: ['sort'],
        fields: ['*']
      })
    );

    res.json({ success: true, data: pages });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch pages' 
    });
  }
};

// Get page by slug
export const getPageBySlug: RequestHandler = async (req, res) => {
  try {
    const { slug } = req.params;

    const pages = await directusClient.request(
      readItems('pages', {
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        limit: 1
      })
    );

    if (!pages || pages.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Page not found' 
      });
    }

    res.json({ success: true, data: pages[0] });
  } catch (error: any) {
    console.error('Error fetching page:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch page' 
    });
  }
};

