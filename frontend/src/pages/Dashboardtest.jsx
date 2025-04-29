import { useAuth } from '../context/AuthContext';

const Dashboardtest = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboardtest;
