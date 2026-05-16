const aiService = require('./services/aiService');
async function test() {
  const structure = await aiService.generateCourseStructure('Yoga');
  console.log(JSON.stringify(structure, null, 2));
}
test();
