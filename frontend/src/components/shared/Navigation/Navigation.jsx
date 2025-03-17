import React from 'react'
import { Link } from 'react-router-dom';
import styles from './Navigation.module.css'
import { logout } from '../../../http';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../../store/authSlice';

const Navigation = () => {

    const brandStyle = {
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '22px',
        display: 'flex',
        alignItems: 'center',
    }

    const logoText = {
        marginLeft: '10px'
    }

    const dispatch = useDispatch();

    async function logoutUser() {
        try {
           const { data } = await logout();
            dispatch(setAuth(data));   
        } catch (err) {
            console.log(err);
        }    
    }
    
  return (
    <nav className={`${styles.navbar} container`}>
        <Link style={brandStyle} to='/'>
            <img src="/images/logo.png" alt="" />
            <span style={logoText}>CoderVimal</span>
        </Link>
        <button onClick={logoutUser}>logout</button>
    </nav>
  )
}

export default Navigation;
