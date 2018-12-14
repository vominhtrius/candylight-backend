require('dotenv').config();

hostAccountService = process.env.hostAccountService;
hostChatService = process.env.hostChatService;
hostLearningService = process.env.hostLearningService;
hostExerciseService = process.env.hostExerciseService;
hostExamination = process.env.hostExamination;
const hostService = {hostAccountService, hostChatService, hostLearningService, hostExerciseService, hostExamination};
module.exports = hostService;
