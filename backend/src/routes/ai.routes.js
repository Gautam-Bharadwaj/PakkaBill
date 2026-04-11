const { Router } = require('express');
const aiController = require('../controllers/Ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/gst-suggestion', aiController.getGstSuggestion.bind(aiController));
router.get('/insights', aiController.getInsights.bind(aiController));
router.post('/chat', aiController.askChat.bind(aiController));

module.exports = router;
