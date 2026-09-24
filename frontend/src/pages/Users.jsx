import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const Users = () => {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const token = localStorage.getItem("token");

  const fetchUsers = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/users?search=${encodeURIComponent(
          searchValue,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
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
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      password: "",
    });

    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      password: "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      return;
    }

    if (!editingUser && !formData.password) {
      setError("Password is required");
      return;
    }

    try {
      if (editingUser) {
        await axios.put(
          `http://localhost:5000/api/users/${editingUser.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSuccess("User updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/users", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSuccess("User created successfully");
      }

      setShowForm(false);

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      fetchUsers(search);
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("User deleted successfully");

      fetchUsers(search);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <>
      <Navbar />

      <div className="page-container">
        <div className="page-header">
          <h1>Users</h1>

          <button onClick={openCreateForm}>+ Add User</button>
        </div>

        {error && <p className="error">{error}</p>}

        {success && <p className="success">{success}</p>}

        <input
          className="search-input"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {showForm && (
          <div className="form-card">
            <h2>{editingUser ? "Edit User" : "Create User"}</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />

              <input
                type="password"
                name="password"
                placeholder={
                  editingUser ? "New password (optional)" : "Password"
                }
                value={formData.password}
                onChange={handleChange}
              />

              <button type="submit">{editingUser ? "Update" : "Create"}</button>

              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>

                    <td>
                      <button onClick={() => openEditForm(user)}>Edit</button>

                      <button onClick={() => handleDelete(user.id)}>
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

export default Users;
