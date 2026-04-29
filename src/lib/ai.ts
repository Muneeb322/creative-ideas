const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export async function chatWithAI(
  userMessage: string,
  history: ChatMessage[] = [],
  productContext?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-api-key") {
    return getFallbackResponse(userMessage);
  }

  const systemPrompt = `You are a helpful shopping assistant for "${process.env.NEXT_PUBLIC_APP_NAME || "Creative Ideas Store"}". 
You help customers find products, answer questions about orders, shipping, returns, and provide product recommendations.
Keep responses concise, friendly, and helpful. Use emojis sparingly.
${productContext ? `\nAvailable products context:\n${productContext}` : ""}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood! I'm ready to help customers." }] },
          ...history,
          { role: "user", parts: [{ text: userMessage }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status);
      return getFallbackResponse(userMessage);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      getFallbackResponse(userMessage)
    );
  } catch (error) {
    console.error("AI chat error:", error);
    return getFallbackResponse(userMessage);
  }
}

export async function getProductRecommendations(
  productName: string,
  productCategory: string,
  allProducts: Array<{ name: string; category: string; price: number }>
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-api-key") {
    return allProducts
      .filter((p) => p.category === productCategory && p.name !== productName)
      .slice(0, 4)
      .map((p) => p.name);
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Given a customer is viewing "${productName}" in the "${productCategory}" category, recommend 4 products from this list that they might also like. Return ONLY the product names separated by newlines, nothing else.\n\nProducts:\n${allProducts.map((p) => `- ${p.name} (${p.category}, $${p.price})`).join("\n")}`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.5, maxOutputTokens: 200 },
      }),
    });

    if (!response.ok) {
      return allProducts
        .filter(
          (p) => p.category === productCategory && p.name !== productName
        )
        .slice(0, 4)
        .map((p) => p.name);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text
      .split("\n")
      .map((line: string) => line.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 4);
  } catch {
    return allProducts
      .filter((p) => p.category === productCategory && p.name !== productName)
      .slice(0, 4)
      .map((p) => p.name);
  }
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("shipping") || lower.includes("delivery")) {
    return "We offer free shipping on orders over $50! Standard delivery takes 3-5 business days. Express shipping (1-2 days) is available at checkout for $12.99.";
  }
  if (lower.includes("return") || lower.includes("refund")) {
    return "We have a 30-day return policy. Items must be in original condition. Refunds are processed within 5-7 business days after we receive the returned item.";
  }
  if (lower.includes("payment") || lower.includes("pay")) {
    return "We accept all major credit cards through Stripe (Visa, Mastercard, Amex). All transactions are secured with SSL encryption.";
  }
  if (lower.includes("order") || lower.includes("track")) {
    return "You can track your order using your order number on our order tracking page. You'll also receive updates via email and WhatsApp!";
  }
  if (lower.includes("contact") || lower.includes("support") || lower.includes("help")) {
    return "You can reach us via WhatsApp for instant support, or email us at info@creative-ideas.com. We're here to help!";
  }
  if (lower.includes("discount") || lower.includes("sale") || lower.includes("coupon")) {
    return "Check out our featured products for the latest deals! We regularly update our sale section with great discounts.";
  }

  return "Thanks for reaching out! I can help you with product recommendations, shipping info, returns, and order tracking. What would you like to know?";
}
