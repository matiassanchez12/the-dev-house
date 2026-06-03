// import type { Plugin } from "@opencode-ai/plugin"

// export default (async ({ client, project, directory, $ }) => {
//   return {
//     "tool.execute.after": async (input, output) => {
//       if (output.error && /model.*fail|rate.?limit|timeout/i.test(String(output.error))) {
//         const fallbacks = ["anthropic/claude-instant-1-2", "mistral/pixtral-12b"]
//         const nextModel = fallbacks.find(m => m !== input.model)
//         if (nextModel) {
//           await client.session.input({
//             ...input,
//             model: nextModel
//           })
//         }
//       }
//     }
//   }
// }) satisfies Plugin