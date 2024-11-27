const express = require('express');
const {
  getAllExperts,
  getExpertById,
  createExpert,
  updateExpert,
  deleteExpert,
} = require('../controllers/expertController');

const router = express.Router();

router.get('/', getAllExperts);
router.get('/:id', getExpertById);
router.post('/', createExpert);
router.put('/:id', updateExpert);
router.delete('/:id', deleteExpert);

module.exports = router;
