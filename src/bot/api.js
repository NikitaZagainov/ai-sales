const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

/**
 * Retrieves a Gemini response based on the input messages, model name, token, proxy, and optional system message.
 *
 * @param {Array} messages - The array of messages to be included in the response.
 * @param {string} modelName - The name of the model used for generating the response.
 * @param {string} token - The authentication token for accessing the model.
 * @param {string} proxy - The proxy URL for making the request.
 * @param {string} [systemMessage=null] - Optional system message to prepend to the messages.
 * @return {string|number} The generated response or an error code.
 */
async function getGeminiResponse(
  messages,
  modelName,
  token,
  proxy,
  systemMessage = null
) {
  newMessages = messages;
  if (systemMessage != null) {
    newMessages = [{ role: "user", content: systemMessage }].concat(messages);
  } 
  geminiMessages = [];
  map = {
    user: "user",
    assistant: "model",
  };
  for (i = 0; i < newMessages.length; i++) {
    geminiMessages.push({
      role: map[newMessages[i].role],
      parts: [{ text: newMessages[i].content }],
    });
  }
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${token}`;
  const agent = new HttpsProxyAgent(proxy);
  try {
    const response = await axios({
      method: "post",
      url: url,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        contents: geminiMessages,
      },
      httpsAgent: agent,
    });
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error getting response:", error);
    return 1;
  }
}

/**
 * Retrieves the user's intent based on the given messages, intents, prompt, model name, token, and proxy.
 *
 * @param {Array<Object>} messages - An array of messages in the dialogue.
 * @param {Array<Object>} intents - An array of intents.
 * @param {string} prompt - The prompt for the dialogue.
 * @param {string} modelName - The name of the model.
 * @param {string} token - The token for authentication.
 * @param {string} proxy - The proxy URL.
 * @return {Promise<string>} The result of the user's intent.
 */
async function getUserIntent(
  messages,
  intents,
  prompt,
  modelName,
  token,
  proxy
) {
  const message =
    `${prompt}\nIntents:\n${JSON.stringify(intents)}\nDialogue:\n${JSON.stringify(messages)}`;
  result = await getGeminiResponse(
    [{ role: "user", content: message }],
    modelName,
    token,
    proxy
  );
  return result;
}

module.exports = { getGeminiResponse, getUserIntent };
