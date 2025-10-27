import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";

const API_BASE = "https://calorease-ai-backend-17865801814.asia-south1.run.app";

describe("Python API Integration Tests", () => {
  it("should return 200 for /health", async () => {
    const res = await axios.get(`${API_BASE}/`);
    expect(res.status).toBe(200);
  });
});

describe("Image Recognition API Integration Tests", () => {
  it("should return 200 for /nutrition", async () => {
    try {
        
      const formData = new FormData();
      formData.append("file", fs.createReadStream("./__tests__/idly.jpg"));

      const res = await axios.post(`${API_BASE}/nutrition`, formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      console.log("✅ Response:", res.data);

      expect(res.status).toBe(200);
      expect(res.data.items).toBeDefined();
      expect(res.data.items.length).toBeGreaterThan(0);
      expect(res.data.items[0].name).toBeDefined();
      expect(res.data.totals.total_calories_kcal).toBeDefined();
    } catch (err: any) {
      console.error(
        "❌ Error:",
        err.response?.status,
        err.response?.data || err.message
      );
      throw err;
    }
  });
});

describe("Recommendation API Integration Tests", () => {
  it("should return 200 for /initial-recommendations", async () => {
    try {
      const requestData = {
        region: "TamilNadu"
      };

      const res = await axios.post(`${API_BASE}/initial-recommendations`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("✅ Initial Recommendations Response:", res.data);

      expect(res.status).toBe(200);
      expect(res.data.region).toBeDefined();
      expect(res.data.dishes).toBeDefined();
      expect(Array.isArray(res.data.dishes)).toBe(true);
      expect(res.data.dishes.length).toBeGreaterThan(0);
      
    } catch (err: any) {
      console.error(
        "❌ Error:",
        err.response?.status,
        err.response?.data || err.message
      );
      throw err;
    }
  });

  it("should return 200 for /recommendations with meal ratings", async () => {
    try {
      const requestData = {
        meals: [
          { name: "Biryani", rating: 5 },
          { name: "Curry", rating: 4 },
          { name: "Dal", rating: 3 }
        ],
        top_k: 5
      };

      const res = await axios.post(`${API_BASE}/recommendations`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("✅ Personalized Recommendations Response:", res.data);

      expect(res.status).toBe(200);
      expect(res.data.recommendations).toBeDefined();
      expect(Array.isArray(res.data.recommendations)).toBe(true);
      
      // Check structure of first recommendation
      if (res.data.recommendations.length > 0) {
        expect(res.data.recommendations[0].name).toBeDefined();
        expect(typeof res.data.recommendations[0].name).toBe('string');
      }

    } catch (err: any) {
      console.error(
        "❌ Error:",
        err.response?.status,
        err.response?.data || err.message
      );
      throw err;
    }
  });


  it("should validate region parameter for initial recommendations", async () => {
    try {
      const requestData = {
        region: "TamilNadu"
      };

      const res = await axios.post(`${API_BASE}/initial-recommendations`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("✅ North India Recommendations Response:", res.data);

      expect(res.status).toBe(200);
      expect(res.data.region).toBeDefined();
      expect(res.data.dishes).toBeDefined();
      expect(Array.isArray(res.data.dishes)).toBe(true);
    } catch (err: any) {
      console.error(
        "❌ Error:",
        err.response?.status,
        err.response?.data || err.message
      );
      throw err;
    }
  });
});

