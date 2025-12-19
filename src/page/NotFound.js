import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <AnimatedPage>
            <div style={{
                textAlign: 'center',
                color: 'white',
                padding: '40px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 0, 110, 0.3)',
                boxShadow: '0 0 30px rgba(255, 0, 110, 0.2)'
            }}>
                <motion.h1
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    style={{ fontSize: '5rem', marginBottom: '0', color: '#ff006e', textShadow: '0 0 20px #ff006e' }}
                >
                    404
                </motion.h1>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontFamily: 'var(--font-heading)', marginTop: '0' }}
                >
                    LOST IN THE VOID
                </motion.h2>
                <p>The coordinates you entered lead to nowhere.</p>
                <br />
                <motion.button
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.05, backgroundColor: 'var(--mv-primary)', color: 'black' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '12px 25px',
                        fontSize: '1.1rem',
                        background: 'transparent',
                        border: '2px solid var(--mv-primary)',
                        color: 'var(--mv-primary)',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                    }}
                >
                    RETURN TO BASE
                </motion.button>
            </div>
        </AnimatedPage>
    );
};

export default NotFound;
