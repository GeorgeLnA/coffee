import { RequestHandler } from "express";
import { readItems, readSingleton } from "@directus/sdk";
import directusClient from "../lib/directus";

// Get global settings
export const getGlobals: RequestHandler = async (req, res) => {
  try {
    const globals = await directusClient.request(
      readSingleton('globals')
    );

    res.json({ success: true, data: globals });
  } catch (error: any) {
    console.error('Error fetching globals:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch globals' 
    });
  }
};

// Get navigation
export const getNavigation: RequestHandler = async (req, res) => {
  try {
    const navigation = await directusClient.request(
      readItems('navigation', {
        fields: ['*', { items: ['*'] }]
      })
    );

    res.json({ success: true, data: navigation });
  } catch (error: any) {
    console.error('Error fetching navigation:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch navigation' 
    });
  }
};

