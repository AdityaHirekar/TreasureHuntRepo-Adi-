import React from 'react';
import { motion } from 'framer-motion';



const AnimatedPage = ({ children }) => {
    const isMobile = window.innerWidth < 768;

    const animations = {
        initial: { opacity: 0, y: isMobile ? 0 : 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: isMobile ? 0 : -20 },
    };

    return (
        <motion.div
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;
