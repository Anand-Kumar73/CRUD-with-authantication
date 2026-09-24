import pool from "../config/db.js";

export const getProducts = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const result = await pool.query(
      `SELECT id, title, price, category, stock, description, created_at
       FROM products
       WHERE title ILIKE $1
          OR category ILIKE $1
       ORDER BY id ASC`,
      [`%${search}%`],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, price, category, stock, description } = req.body;

    if (!title || price === undefined || !category || stock === undefined) {
      return res.status(400).json({
        message: "Title, price, category and stock are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO products
       (title, price, category, stock, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, price, category, stock, description || null],
    );

    res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, price, category, stock, description } = req.body;

    if (!title || price === undefined || !category || stock === undefined) {
      return res.status(400).json({
        message: "Title, price, category and stock are required",
      });
    }

    const result = await pool.query(
      `UPDATE products
       SET title = $1,
           price = $2,
           category = $3,
           stock = $4,
           description = $5
       WHERE id = $6
       RETURNING *`,
      [title, price, category, stock, description || null, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};
