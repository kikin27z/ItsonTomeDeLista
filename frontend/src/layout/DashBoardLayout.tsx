import { Outlet, useMatch, useNavigate } from 'react-router';
import Header from '../components/header/Header'
import { useAuth } from '../hooks/auth-data';
import '../styles/dashboard.css';
import { useEffect } from 'react';
import Loading from '../components/dashboard/Loading';
const DashBoardLayout = () => {
    const defaultUrl = useMatch("/dashboard/");
    const { user,isLoading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if(isLoading) return;
        
        if (defaultUrl) {
            if (user?.userType === "STUDENT") {
                navigate("/dashboard/student");
            } else {
                navigate("/dashboard/teacher");
            }
        }
    },[isLoading]);

    if (isLoading) {
        return <Loading message="Cargando usuario..." />;
    }

    return (
        <div className='dashboard-container'>
            <Header />
            <Outlet />

            <footer className='dash-footer'>
                <h4>Team: Mugiwara</h4>
            </footer>
        </div>
    )
}

export default DashBoardLayout