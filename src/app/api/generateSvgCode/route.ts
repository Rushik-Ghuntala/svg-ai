import Together from "together-ai";
import { z } from "zod";

// Initialize Together API with options
// let options: ConstructorParameters<typeof Together>[0] = {
//   baseURL: "https://api.together.ai/v1",
//   // Remove the Helicone headers and replace them with Together-specific headers if needed
//   defaultHeaders: {
//     Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`, // Set Together AI API Key
//   },
// };

let options: ConstructorParameters<typeof Together>[0] = {};
if (process.env.HELICONE_API_KEY) {
  options.baseURL = "https://together.helicone.ai/v1";
  options.defaultHeaders = {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  };
}

let together = new Together(options);

export async function POST(req: Request) {
  let json = await req.json();

  // Validation schema using Zod
  let result = z
    .object({
      model: z.string(),
      messages: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      ),
    })
    .safeParse(json);

  if (result.error) {
    return new Response(result.error.message, { status: 422 });
  }

  let { model, messages } = result.data;

  // Send the request to Together API for code generation
  let res = await together.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: getSystemPrompt(), // Get a system prompt specific for SVG generation
      },
      ...messages.map((message) => ({
        ...message,
        content: message.content + "\nPlease ONLY return SVG code.",
      })),
    ],
    stream: true, // Use stream for better performance if needed
    temperature: 0.5, // Adjust the creativity level if needed
  });

  // Stream the result back as SVG code
  let svgStream = res
    .toReadableStream()
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          if (chunk) {
            try {
              let text = JSON.parse(chunk).choices[0].text;
              controller.enqueue(text);
            } catch (error) {
              console.error(error);
            }
          }
        },
      })
    )
    .pipeThrough(new TextEncoderStream());

  return new Response(svgStream, {
    headers: new Headers({
      "Cache-Control": "no-cache",
    }),
  });
}

// Function to generate a system prompt for SVG generation
function getSystemPrompt() {
  let systemPrompt = `
    You are an expert svg engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

    - Create a SVG for whatever the user asked you to create
    - Make sure the SVG is very accurate and beautifull
    - Please create an SVG based on the user’s description.
    - Optimize the SVG for size and performance.
    - DO NOT return extra information like comments or additional descriptions, ONLY return the SVG code.
    - Ensure the SVG is valid and properly formatted.
  
    `;
  return systemPrompt;
}

export const runtime = "edge";
