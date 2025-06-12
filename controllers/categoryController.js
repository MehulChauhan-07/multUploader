const Category = require('../models/Category');
const File = require('../models/File');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = new Category({
            name,
            description,
            createdBy: req.user?.id || 'anonymous'
        });

        await category.save();

        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.assignFileToCategory = async (req, res) => {
    try {
        const { fileId, categoryId } = req.body;

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        category.files.push(fileId);
        await category.save();

        res.status(200).json({ message: 'File assigned to category successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};