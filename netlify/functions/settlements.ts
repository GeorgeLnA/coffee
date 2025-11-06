import type { Handler } from "@netlify/functions";

// Nova Poshta API
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

/**
 * Netlify serverless function for Nova Poshta settlements search
 * GET /api/settlements?cityName=...
 */
export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: "",
    };
  }

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // Get API key from environment
    const apiKey = process.env.NOVA_POSHTA_API_KEY || process.env.VITE_NOVA_POSHTA_API_KEY || "";
    const cityName = (event.queryStringParameters?.cityName || "").trim();
    
    // Debug logging
    console.log('Nova Poshta Settlements API:', {
      hasEnvVar: !!process.env.NOVA_POSHTA_API_KEY,
      hasViteVar: !!process.env.VITE_NOVA_POSHTA_API_KEY,
      keyLength: apiKey.length,
      cityName,
    });
    
    if (!cityName) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: [] }),
      };
    }

    // Try searchSettlements first
    const bodySearch = {
      apiKey: apiKey || "",
      modelName: "Address",
      calledMethod: "searchSettlements",
      methodProperties: {
        CityName: cityName,
        Limit: 50,
        Page: 1
      }
    };

    const resp = await fetch(NP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodySearch)
    });

    const json = await resp.json();

    if (json.success && json.data) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: json.data }),
      };
    }

    // Fallback to getCities
    const bodyCities = {
      apiKey: apiKey || "",
      modelName: "Address",
      calledMethod: "getCities",
      methodProperties: {
        FindByString: cityName,
        Page: 1
      }
    };

    const resp2 = await fetch(NP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyCities)
    });
    const json2 = await resp2.json();

    if (json2.success && Array.isArray(json2.data)) {
      // Map to the same shape as Addresses
      const mapped = json2.data.map((c: any) => ({
        Present: c.Description,
        Description: c.Description,
        MainDescription: c.AreaDescription,
        Ref: c.Ref,
      }));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: [{ Addresses: mapped }] }),
      };
    }

    console.error("Nova Poshta API error:", json, json2);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: json.errors?.[0] || json2.errors?.[0] || "Failed to search settlements" }),
    };
  } catch (error: any) {
    console.error("Error in settlements function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error?.message || "Failed to fetch settlements" }),
    };
  }
};

