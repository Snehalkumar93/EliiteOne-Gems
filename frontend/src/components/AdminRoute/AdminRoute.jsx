import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
    const { role, token } = useContext(StoreContext);

    if (!token || role !== 'admin') {
        toast.error("Access denied. Admin privileges required.");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
