import React from 'react';
import { motion } from 'framer-motion';

const Spinner = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <motion.div
                style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                    borderTop: '4px solid var(--mv-primary)',
                    borderRadius: '50%',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
                style={{ marginTop: '15px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                Loading...
            </motion.p>
        </div>
    );
};

export default Spinner;
