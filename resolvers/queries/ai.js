/**
 * Query resolvers — ai.
 *
 * Split out of the monolithic resolvers/Query.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/queryPolicy.js.
 */
const {
  logger,
} = require("./_shared");

module.exports = {
  getAIResponse: async (_, {prompt}, {openai}) => {

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: prompt,
    });
    logger.debug(chatCompletion.choices[0].message);
    return { message: chatCompletion.choices[0].message.content}
  }
};
