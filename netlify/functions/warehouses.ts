import type { Handler } from "@netlify/functions";

// Nova Poshta API
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

/**
 * Netlify serverless function for Nova Poshta warehouses
 * GET /api/warehouses?cityRef=...&type=...
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
    const cityRef = (event.queryStringParameters?.cityRef || "").trim();
    const type = (event.queryStringParameters?.type || "").trim(); // "postomat" or "department"
    
    // Debug logging
    console.log('Nova Poshta Warehouses API:', {
      hasEnvVar: !!process.env.NOVA_POSHTA_API_KEY,
      hasViteVar: !!process.env.VITE_NOVA_POSHTA_API_KEY,
      keyLength: apiKey.length,
      cityRef,
      type,
    });
    
    if (!cityRef) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: [] }),
      };
    }

    const body = {
      apiKey: apiKey || "",
      modelName: "AddressGeneral",
      calledMethod: "getWarehouses",
      methodProperties: {
        SettlementRef: cityRef,
        Limit: 500,
        Page: 1
      }
    };

    const resp = await fetch(NP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const json = await resp.json();
    
    if (json.success && json.data) {
      let filteredData = json.data;
      
      // Filter by type if specified
      if (type === "postomat") {
        filteredData = json.data.filter((wh: any) => {
          const typeOfWarehouse = String(wh.TypeOfWarehouse || "");
          const desc = String(wh.Description || "").toLowerCase();
          const addr = String(wh.ShortAddress || "").toLowerCase();
          return (
            typeOfWarehouse === "9" ||
            desc.includes("поштомат") ||
            addr.includes("поштомат")
          );
        });
      } else if (type === "department") {
        filteredData = json.data.filter((wh: any) => {
          const typeOfWarehouse = String(wh.TypeOfWarehouse || "");
          const desc = String(wh.Description || "").toLowerCase();
          const addr = String(wh.ShortAddress || "").toLowerCase();
          return (
            typeOfWarehouse !== "9" &&
            !desc.includes("поштомат") &&
            !addr.includes("поштомат")
          );
        });
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: "200", data: filteredData }),
      };
    } else {
      console.error("Nova Poshta API error:", json);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: json.errors?.[0] || "Failed to fetch warehouses" }),
      };
    }
  } catch (error: any) {
    console.error("Error in warehouses function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error?.message || "Failed to fetch warehouses" }),
    };
  }
};

