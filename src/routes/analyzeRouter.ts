import express from "express";

export type AnalyzeRequest = {
  text: string;
};

export type AnalyzeResponse = {
  score: number;
  classification: "Seguro" | "Atenção" | "Alto risco";
  confidence: number;
  message: string;
  risks: string[];
  tips: string[];
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-3.5-turbo";

const ALLOWED_CLASSIFICATIONS = ["Seguro", "Atenção", "Alto risco"] as const;

const router = express.Router();

router.options("/analyze", (_req, res) => {
  res.sendStatus(204);
});

router.post("/analyze", async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ message: "OpenAI API key is not configured." });
  }

  const validationError = validateAnalyzeRequest(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const rawResponse = await callOpenAI(req.body.text);
    const analysis = parseOpenAIResponse(rawResponse);
    return res.status(200).json(analysis);
  } catch (error) {
    console.error("Analyze error:", error);
    return res.status(500).json({
      error: "Falha ao processar a análise. Tente novamente mais tarde.",
    });
  }
});

export default router;

function validateAnalyzeRequest(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return "Payload inválido. Envie um objeto JSON com a propriedade 'text'.";
  }

  const request = payload as { text?: unknown };
  if (typeof request.text !== "string" || !request.text.trim()) {
    return "O campo 'text' é obrigatório e deve ser uma string não vazia.";
  }

  return null;
}

async function callOpenAI(text: string): Promise<string> {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "Você é um analisador de risco de conteúdo. Recebe textos em português e devolve apenas um objeto JSON com os campos score, classification, confidence, message, risks e tips. classification deve ser Seguro, Atenção ou Alto risco. risks e tips são listas de até 5 strings.",
        },
        {
          role: "user",
          content:
            "Analise o risco do texto abaixo e responda exclusivamente com JSON válido.\n\nTexto: " +
            text +
            "\n\nExemplo de formato de resposta: {\n  \"score\": 68,\n  \"classification\": \"Atenção\",\n  \"confidence\": 85,\n  \"message\": \"O texto contém sinais moderados de risco.\",\n  \"risks\": [\"Linguagem agressiva\", \"Menções de violência\"],\n  \"tips\": [\"Revise o conteúdo antes de publicar\", \"Use termos mais neutros\"]\n}",
        },
      ],
      max_tokens: 400,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${body}`);
  }

  const payload = await response.json();
  const textResponse = String(
    payload?.choices?.[0]?.message?.content ?? ""
  ).trim();

  if (!textResponse) {
    throw new Error("Resposta vazia da OpenAI.");
  }

  return textResponse;
}

function parseOpenAIResponse(raw: string): AnalyzeResponse {
  const jsonString = extractJsonString(raw);
  const parsed = JSON.parse(jsonString) as Partial<AnalyzeResponse>;

  const score = Number(parsed.score ?? NaN);
  const confidence = Number(parsed.confidence ?? NaN);
  const classificationRaw = String(parsed.classification ?? "").trim();
  const classification = normalizeClassification(classificationRaw);
  const message = String(parsed.message ?? "").trim();
  const risks = normalizeStringArray(parsed.risks);
  const tips = normalizeStringArray(parsed.tips);

  if (
    Number.isNaN(score) || score < 0 || score > 100 ||
    Number.isNaN(confidence) || confidence < 0 || confidence > 100 ||
    !classification ||
    !message ||
    risks.length === 0 ||
    tips.length === 0
  ) {
    throw new Error("Resposta da OpenAI não segue o formato esperado.");
  }

  return {
    score,
    classification,
    confidence,
    message,
    risks: risks.slice(0, 5),
    tips: tips.slice(0, 5),
  };
}

function normalizeClassification(value: string): AnalyzeResponse["classification"] | null {
  const normalized = value.toLowerCase();
  if (normalized.includes("seguro")) {
    return "Seguro";
  }
  if (normalized.includes("atenção") || normalized.includes("atencao")) {
    return "Atenção";
  }
  if (normalized.includes("alto risco") || normalized.includes("alto risco")) {
    return "Alto risco";
  }
  return null;
}

function extractJsonString(input: string): string {
  const firstBrace = input.indexOf("{");
  const lastBrace = input.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Não foi possível localizar JSON na resposta da OpenAI.");
  }
  return input.slice(firstBrace, lastBrace + 1);
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim())
      .slice(0, 5);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|\s*[,;]\s*/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 5);
  }

  return [];
}
