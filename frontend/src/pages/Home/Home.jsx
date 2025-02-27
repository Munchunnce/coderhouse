import React from 'react'
import styles from './Home.module.css';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/shared/Card/Card';
import Button from '../../components/shared/Button/Button';



const Home = () => {

    const signInLinkStyle = {
        color: '#0077ff',
        fontWeight: 'bold',
        textDecoration: 'none',
        marginLeft: '10px'

    }

    const navigate = useNavigate();

    const startRegister = () => {
        console.log('Vimal')
        navigate('/register');
    }

    return (
        <div className={styles.cardWrapper}>
            <Card title='Welcome to CoderVimal!' icon='logo'>
            <p className={styles.text}>Welcome to Codershouse!
                We’re working hard to get Codershouse ready for everyone! While we wrap up the finishing youches, we’re adding people gradually to make sure nothing breaks :)
            </p>
            <Button onClick={startRegister} text="Let's Go"/>
            <div className={styles.signInWrapper}>
                <span className={styles.hasInvite}>Have an invite text?</span>
                <Link style={signInLinkStyle} to='/login'>Sign In</Link>
            </div>
            </Card>



            {/* <div className={styles.card}>
            <div className={styles.headingWrapper}>
                <img src="/images/logo.png" alt="logo" />
                <h1 className={styles.heading}>Welcome to CoderVimal!</h1>
            </div>
            <p className={styles.text}>Welcome to Codershouse!
                We’re working hard to get Codershouse ready for everyone! While we wrap up the finishing youches, we’re adding people gradually to make sure nothing breaks :)
            </p>
            <div className="">
                <button>
                    <span>Let's Go</span>
                    <img src="/images/arrow-forward.png" alt="arrow" />
                </button>
            </div>
            <div className={styles.signInWrapper}>
                <span className={styles.hasInvite}>Have an invite text?</span>
                <Link to='/login'>Sign In</Link>
            </div>
        </div> */}
        </div>
    
    )
}

export default Home;
