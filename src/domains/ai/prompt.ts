import { COMPLAINT_CATEGORIES } from "@/domains/complaints/types";

export const CLASSIFICATION_SYSTEM_PROMPT = `You are classifying a civic infrastructure complaint.

Choose exactly one category from:

${COMPLAINT_CATEGORIES.join("\n")}

Return JSON with exactly these keys:
- category: one of the categories above
- description: one concise sentence describing what you see

If the image does not clearly match one of the categories, choose OTHER.

Do not invent categories. Do not include any keys other than category and description.`;

export const CLASSIFICATION_USER_PROMPT =
  "Classify this civic infrastructure complaint photograph.";
