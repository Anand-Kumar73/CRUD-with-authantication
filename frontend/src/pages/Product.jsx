import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const Products = () => {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    stock: "",
    description: "",
  });

  const token = localStorage.getItem("token");

  const fetchProducts = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/products?search=${encodeURIComponent(
          searchValue,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProducts(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateForm = () => {
    setEditingProduct(null);

    setFormData({
      title: "",
      price: "",
      category: "",
      stock: "",
      description: "",
    });

    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);

    setFormData({
      title: product.title,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.title ||
      formData.price === "" ||
      !formData.category ||
      formData.stock === ""
    ) {
      setError("Title, price, category and stock are required");
      return;
    }

    try {
      if (editingProduct) {
        await axios.put(
          `http://localhost:5000/api/products/${editingProduct.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSuccess("Product updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/products", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSuccess("Product created successfully");
      }

      setShowForm(false);

      setFormData({
        title: "",
        price: "",
        category: "",
        stock: "",
        description: "",
      });

      fetchProducts(search);
    } catch (error) {
      console.error("Product save failed:", error);
      setError(
        error.response?.data?.message ||
          (error.request
            ? "Backend se response nahi mila. Backend server (localhost:5000) chalu hai ya nahi check karein."
            : error.message || "Product save nahi ho saka."),
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Product deleted successfully");

      fetchProducts(search);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <>
      <Navbar />

      <div className="page-container">
        <div className="page-header">
          <h1>Products</h1>

          <button onClick={openCreateForm}>+ Add Product</button>
        </div>

        {error && <p className="error">{error}</p>}

        {success && <p className="success">{success}</p>}

        <input
          className="search-input"
          type="text"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {showForm && (
          <div className="form-card">
            <h2>{editingProduct ? "Edit Product" : "Create Product"}</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
              />

              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
              />

              <button type="submit">
                {editingProduct ? "Update" : "Create"}
              </button>

              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.title}</td>
                    <td>₹{product.price}</td>
                    <td>{product.category}</td>
                    <td>{product.stock}</td>
                    <td>{product.description}</td>

                    <td>
                      <button onClick={() => openEditForm(product)}>
                        Edit
                      </button>

                      <button onClick={() => handleDelete(product.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
