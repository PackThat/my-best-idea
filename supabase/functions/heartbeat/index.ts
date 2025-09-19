// Import the serve function from the Deno standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// These headers are important to allow your function to be called from anywhere
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
};

// Start the function and listen for requests
serve(async (req) => {
  // This part handles a pre-flight request, which is a browser safety check.
  // It's good practice to include it.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // This is the main response.
  // It sends back a simple message with a "200 OK" success status.
  return new Response(JSON.stringify({ message: "Hello from your PackThat app!" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});