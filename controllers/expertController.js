const Expert = require('../models/Expert');

// Get all experts
exports.getAllExperts = async (req, res) => {
  try {
    const experts = await Expert.find();
    res.status(200).json(experts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch experts', error });
  }
};

// Get a single expert by ID
exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ message: 'Expert not found' });
    res.status(200).json(expert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expert', error });
  }
};

// Add a new expert
exports.createExpert = async (req, res) => {
  try {
    const {  name, degree, experience } = req.body;
    const newExpert = new Expert({ name, degree, experience });
    await newExpert.save();
    res.status(201).json(newExpert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create expert', error });
  }
};

// Update an existing expert
exports.updateExpert = async (req, res) => {
  try {
    const {  name, degree, experience } = req.body;
    const updatedExpert = await Expert.findByIdAndUpdate(
      req.params.id,
      {  name, degree, experience },
      { new: true }
    );
    if (!updatedExpert) return res.status(404).json({ message: 'Expert not found' });
    res.status(200).json(updatedExpert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update expert', error });
  }
};

// Delete an expert
exports.deleteExpert = async (req, res) => {
  try {
    const deletedExpert = await Expert.findByIdAndDelete(req.params.id);
    if (!deletedExpert) return res.status(404).json({ message: 'Expert not found' });
    res.status(200).json({ message: 'Expert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expert', error });
  }
};
