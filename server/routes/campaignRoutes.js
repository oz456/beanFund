const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

router.get('/', campaignController.getCampaigns);
router.post('/', campaignController.createCampaign);
router.get('/:id', campaignController.getCampaignById);
router.post('/:id/pledge', campaignController.pledgeCampaign);
router.post('/:id/messages', campaignController.addGuestbookMessage);
router.post('/:id/polls/:pollId/vote', campaignController.votePoll);
router.post('/:id/updates/:updateId/react', campaignController.reactUpdate);
router.post('/:id/updates', campaignController.createUpdate);
router.post('/:id/polls', campaignController.createPoll);

module.exports = router;
