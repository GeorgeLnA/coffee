import type { Handler } from '@netlify/functions';

/**
 * Compare deployment configurations between two Netlify sites
 * This helps identify why one domain works and another doesn't
 */
export const handler: Handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // Check if functions are accessible
  const functionChecks = {
    // Check if this function itself is working
    thisFunction: 'working',
    
    // Environment variables
    env: {
      // Nova Poshta
      NOVA_POSHTA_API_KEY: {
        present: !!process.env.NOVA_POSHTA_API_KEY,
        length: process.env.NOVA_POSHTA_API_KEY?.length || 0,
        preview: process.env.NOVA_POSHTA_API_KEY ? `${process.env.NOVA_POSHTA_API_KEY.substring(0, 4)}...` : 'missing',
      },
      VITE_NOVA_POSHTA_API_KEY: {
        present: !!process.env.VITE_NOVA_POSHTA_API_KEY,
        length: process.env.VITE_NOVA_POSHTA_API_KEY?.length || 0,
        preview: process.env.VITE_NOVA_POSHTA_API_KEY ? `${process.env.VITE_NOVA_POSHTA_API_KEY.substring(0, 4)}...` : 'missing',
      },
      
      // Supabase
      SUPABASE_URL: {
        present: !!process.env.SUPABASE_URL,
        value: process.env.SUPABASE_URL || 'missing',
      },
      VITE_SUPABASE_URL: {
        present: !!process.env.VITE_SUPABASE_URL,
        value: process.env.VITE_SUPABASE_URL || 'missing',
      },
      
      // LiqPay
      LIQPAY_PUBLIC_KEY: {
        present: !!process.env.LIQPAY_PUBLIC_KEY,
        length: process.env.LIQPAY_PUBLIC_KEY?.length || 0,
      },
      VITE_LIQPAY_PUBLIC_KEY: {
        present: !!process.env.VITE_LIQPAY_PUBLIC_KEY,
        length: process.env.VITE_LIQPAY_PUBLIC_KEY?.length || 0,
      },
      
      // EmailJS
      EMAILJS_SERVICE_ID: {
        present: !!process.env.EMAILJS_SERVICE_ID,
        preview: process.env.EMAILJS_SERVICE_ID ? `${process.env.EMAILJS_SERVICE_ID.substring(0, 8)}...` : 'missing',
      },
    },
    
    // Deployment info
    deployment: {
      url: process.env.URL || 'unknown',
      deployUrl: process.env.DEPLOY_PRIME_URL || 'unknown',
      branch: process.env.BRANCH || 'unknown',
      context: process.env.CONTEXT || 'unknown',
      nodeVersion: process.version,
    },
    
    // Function availability check
    functionsAvailable: {
      // These should exist if functions are deployed
      note: 'If functions are deployed, they should be accessible at /.netlify/functions/[name]',
    },
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(functionChecks, null, 2),
  };
};

