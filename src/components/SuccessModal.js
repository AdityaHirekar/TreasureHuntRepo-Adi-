import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SuccessModal = ({ isOpen, onClose, message, nextClue }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 2000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px'
                    }}
                >
                    <motion.div
                        className="success-modal"
                        initial={{ scale: 0.5, y: 50, opacity: 0, rotateX: 20 }}
                        animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        style={{
                            background: 'rgba(0, 20, 0, 0.8)',
                            border: '1px solid #00ff88',
                            boxShadow: '0 0 30px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1)',
                            borderRadius: '20px',
                            padding: '30px',
                            maxWidth: '400px',
                            width: '100%',
                            textAlign: 'center',
                            color: '#fff',
                            fontFamily: "'Orbitron', sans-serif"
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            style={{ fontSize: '50px', marginBottom: '20px' }}
                        >
                            🎉
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                color: '#00ff88',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontSize: '1.8rem',
                                marginBottom: '15px'
                            }}
                        >
                            Target Verified
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                background: 'rgba(0,0,0,0.5)',
                                padding: '15px',
                                borderRadius: '10px',
                                border: '1px dashed rgba(255,255,255,0.3)',
                                margin: '20px 0'
                            }}
                        >
                            <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '5px' }}>NEXT OBJECTIVE</p>
                            <p style={{
                                fontSize: '1.1rem',
                                lineHeight: '1.5',
                                color: '#fff',
                                fontWeight: 'bold'
                            }}>
                                {nextClue || "Proceed to extraction point."}
                            </p>
                        </motion.div>

                        <motion.button
                            onClick={onClose}
                            whileHover={{ scale: 1.05, backgroundColor: '#00ff88', color: '#000' }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                background: 'transparent',
                                border: '2px solid #00ff88',
                                color: '#00ff88',
                                padding: '12px 30px',
                                borderRadius: '50px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                letterSpacing: '1px',
                                marginTop: '10px'
                            }}
                        >
                            CONTINUE MISSION
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessModal;
