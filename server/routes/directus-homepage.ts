import { RequestHandler } from "express";
import { readItems, readSingleton } from "@directus/sdk";
import directusClient from "../lib/directus";

// Get homepage settings
export const getHomepageSettings: RequestHandler = async (req, res) => {
  try {
    const settings = await directusClient.request(
      readSingleton('homepage_settings', {
        fields: ['*']
      })
    );

    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Error fetching homepage settings:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch homepage settings' 
    });
  }
};

// Get featured products
export const getFeaturedProducts: RequestHandler = async (req, res) => {
  try {
    const products = await directusClient.request(
      readItems('homepage_featured_products', {
        filter: {
          status: { _eq: 'published' }
        },
        sort: ['sort'],
        fields: ['*']
      })
    );

    res.json({ success: true, data: products });
  } catch (error: any) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch featured products' 
    });
  }
};

// Get trade points
export const getTradePoints: RequestHandler = async (req, res) => {
  try {
    const tradePoints = await directusClient.request(
      readItems('trade_points', {
        filter: {
          status: { _eq: 'published' }
        },
        fields: ['*']
      })
    );

    res.json({ success: true, data: tradePoints });
  } catch (error: any) {
    console.error('Error fetching trade points:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch trade points' 
    });
  }
};


