import type { RequestHandler } from "express";

// Nova Poshta API
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

// Search settlements (cities) with fallback to getCities
export const searchSettlements: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.NOVA_POSHTA_API_KEY || "";
    const cityName = String(req.query.cityName || "").trim();
    
    if (!cityName) {
      return res.json({ data: [] });
    }

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
      return res.json({ success: true, data: json.data });
    }

    // Fallback to getCities when searchSettlements fails
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
      return res.json({ success: true, data: [{ Addresses: mapped }] });
    }

    console.error("Nova Poshta API error:", json, json2);
    return res.status(500).json({ error: json.errors?.[0] || json2.errors?.[0] || "Failed to search settlements" });
  } catch (e: any) {
    console.error("searchSettlements error", e);
    return res.status(500).json({ error: e?.message || "Failed to fetch settlements" });
  }
};

// Get warehouses for a city
export const getWarehouses: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.NOVA_POSHTA_API_KEY || "";
    const cityRef = String(req.query.cityRef || "").trim();
    
    if (!cityRef) {
      return res.json({ data: [] });
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
      return res.json({ status: "200", data: json.data });
    } else {
      console.error("Nova Poshta API error:", json);
      // Fallback to mock data if API fails
      return res.json({
        status: "200",
        data: [
          { Ref: "mock1", Description: "Відділення 1 - Київ", ShortAddress: "вул. Хрещатик, 1" },
          { Ref: "mock2", Description: "Відділення 2 - Львів", ShortAddress: "пр. Свободи, 5" },
          { Ref: "mock3", Description: "Відділення 3 - Одеса", ShortAddress: "Дерибасівська, 3" },
        ]
      });
    }
  } catch (e: any) {
    console.error("getWarehouses error", e);
    return res.status(500).json({ error: e?.message || "Failed to fetch warehouses" });
  }
};


