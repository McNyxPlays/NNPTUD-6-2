const slugify = require('slugify');

// Dữ liệu (tạm lưu trong memory)
// Trong thực tế nên thay bằng database (MongoDB, Prisma, Sequelize, v.v.)
const categories = require('../data/categories');
let products = require('../data/products'); // có thể thay bằng DB sau

// GET ALL categories + filter theo name (query string ?name=...)
const getAllCategories = (req, res) => {
  try {
    let result = [...categories];

    const { name } = req.query;
    if (name) {
      result = result.filter(cat =>
        cat.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    res.status(200).json({
      status: 'success',
      results: result.length,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// GET one category by ID
const getCategoryById = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = categories.find(cat => cat.id === id);

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: `Category with ID ${id} not found`
      });
    }

    res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// GET one category by slug
const getCategoryBySlug = (req, res) => {
  try {
    const { slug } = req.params;
    const category = categories.find(cat => cat.slug === slug);

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: `Category with slug "${slug}" not found`
      });
    }

    res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// GET products by category ID
const getProductsByCategoryId = (req, res) => {
  try {
    const categoryId = parseInt(req.params.id, 10);

    // Kiểm tra category tồn tại
    const categoryExists = categories.some(cat => cat.id === categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        status: 'error',
        message: `Category with ID ${categoryId} not found`
      });
    }

    const categoryProducts = products.filter(p => p.categoryId === categoryId);

    res.status(200).json({
      status: 'success',
      results: categoryProducts.length,
      data: categoryProducts
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// CREATE new category
const createCategory = (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required and must be a non-empty string'
      });
    }

    const newSlug = slugify(name, { lower: true, strict: true, trim: true });

    // Kiểm tra slug trùng
    if (categories.some(cat => cat.slug === newSlug)) {
      return res.status(409).json({
        status: 'error',
        message: `Category with slug "${newSlug}" already exists`
      });
    }

    const newId = categories.length > 0
      ? Math.max(...categories.map(c => c.id)) + 1
      : 1;

    const now = new Date().toISOString();

    const newCategory = {
      id: newId,
      name: name.trim(),
      slug: newSlug,
      image: image || 'https://placehold.co/600x400?text=No+Image',
      creationAt: now,
      updatedAt: now
    };

    categories.push(newCategory);

    res.status(201).json({
      status: 'success',
      data: newCategory
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// UPDATE category (PATCH)
const updateCategory = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, image } = req.body;

    const category = categories.find(cat => cat.id === id);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: `Category with ID ${id} not found`
      });
    }

    let updated = false;

    if (name && typeof name === 'string' && name.trim() !== '') {
      const newSlug = slugify(name, { lower: true, strict: true, trim: true });

      // Kiểm tra slug trùng với category khác
      const slugConflict = categories.some(
        cat => cat.id !== id && cat.slug === newSlug
      );

      if (slugConflict) {
        return res.status(409).json({
          status: 'error',
          message: `Slug "${newSlug}" is already in use by another category`
        });
      }

      category.name = name.trim();
      category.slug = newSlug;
      updated = true;
    }

    if (image && typeof image === 'string') {
      category.image = image;
      updated = true;
    }

    if (updated) {
      category.updatedAt = new Date().toISOString();
    }

    res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// DELETE category
const deleteCategory = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const index = categories.findIndex(cat => cat.id === id);

    if (index === -1) {
      return res.status(404).json({
        status: 'error',
        message: `Category with ID ${id} not found`
      });
    }

    categories.splice(index, 1);


    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getProductsByCategoryId,
  createCategory,
  updateCategory,
  deleteCategory
};