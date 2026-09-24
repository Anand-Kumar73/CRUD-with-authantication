import bcrypt from "bcryptjs";
import pool from "../config/db.js";

export const getUser = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const result = await pool.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE name ILIKE $1 OR email ILIKE $1
       ORDER BY id ASC`,
      [`%${search}%`],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Failed to fetch users:", error.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword],
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to create user:", error.message);
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const result = password
      ? await pool.query(
          `UPDATE users
           SET name = $1, email = $2, password = $3
           WHERE id = $4
           RETURNING id, name, email, created_at`,
          [name, email, await bcrypt.hash(password, 10), id],
        )
      : await pool.query(
          `UPDATE users
           SET name = $1, email = $2
           WHERE id = $3
           RETURNING id, name, email, created_at`,
          [name, email, id],
        );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to update user:", error.message);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error.message);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
