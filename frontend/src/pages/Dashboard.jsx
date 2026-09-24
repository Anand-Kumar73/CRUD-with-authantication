import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <h1>Welcome, {user?.name || "User"} 👋</h1>

        <p>
          You are successfully logged in to the dashboard.
        </p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h2>Users</h2>
            <p>Manage all users</p>
            <Link to="/users">Manage Users</Link>
          </div>

          <div className="dashboard-card">
            <h2>Products</h2>
            <p>Manage all products</p>
            <Link to="/products">Manage Products</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;