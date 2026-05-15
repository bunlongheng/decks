/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase server client (we hit the localhost path via host header anyway)
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  })),
}));

// Mock the Anthropic SDK with a controllable response
let mockText = "";
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: async () => ({
          content: [{ type: "text", text: mockText }],
        }),
      };
    },
  };
});

import { POST } from "@/app/api/generate-deck/route";

function makeReq(body: unknown) {
  return new Request("http://localhost:3010/api/generate-deck", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "localhost:3010" },
    body: JSON.stringify(body),
  }) as any;
}

beforeEach(() => {
  mockText = "";
});

describe("POST /api/generate-deck", () => {
  it("returns 200 HTML for valid model output", async () => {
    mockText = JSON.stringify({
      title: "Intro to WebSockets",
      mode: "slides",
      sections: [
        { type: "cover", title: "Intro to WebSockets", subtitle: "Real-time the right way" },
        { type: "summary", points: ["Persistent", "Bidirectional"] },
      ],
    });
    const res = await POST(makeReq({ topic: "Intro to WebSockets", theme: "corporate" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('class="slide');
  });

  it("returns 502 for malformed model output (after retry)", async () => {
    mockText = "I cannot do that. No JSON here.";
    const res = await POST(makeReq({ topic: "anything", theme: "minimal" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});
