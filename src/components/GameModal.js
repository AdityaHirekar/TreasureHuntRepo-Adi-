import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const modalStyles = {
    SUCCESS: {
        borderColor: '#00ff88',
        boxShadow: '0 0 30px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1)',
        background: 'rgba(0, 20, 0, 0.9)',
        color: '#00ff88',
        icon: '🎉',
        buttonColor: '#00ff88',
        title: 'Target Verified'
    },
    WINNER: {
        borderColor: '#ffd700',
        boxShadow: '0 0 40px rgba(255, 215, 0, 0.5), inset 0 0 30px rgba(255, 215, 0, 0.2)',
        background: 'rgba(20, 20, 0, 0.95)',
        color: '#ffd700',
        icon: '🏆',
        buttonColor: '#ffd700',
        title: 'CHAMPION'
    },
    RANK: {
        borderColor: '#00bfff',
        boxShadow: '0 0 30px rgba(0, 191, 255, 0.4), inset 0 0 20px rgba(0, 191, 255, 0.2)',
        background: 'rgba(0, 10, 25, 0.9)',
        color: '#00bfff',
        icon: '🏅',
        buttonColor: '#00bfff',
        title: 'MISSION COMPLETE'
    },
    FAILURE: {
        borderColor: '#ffaa00',
        boxShadow: '0 0 30px rgba(255, 170, 0, 0.3), inset 0 0 20px rgba(255, 170, 0, 0.1)',
        background: 'rgba(20, 10, 0, 0.9)',
        color: '#ffaa00',
        icon: '⚠️',
        buttonColor: '#ffaa00',
        title: 'Target Mismatch'
    },
    DISQUALIFIED: {
        borderColor: '#ff3333',
        boxShadow: '0 0 50px rgba(255, 0, 0, 0.6), inset 0 0 30px rgba(255, 0, 0, 0.3)',
        background: 'rgba(20, 0, 0, 0.98)',
        color: '#ff3333',
        icon: '⛔',
        buttonColor: '#ff3333',
        title: 'DISQUALIFIED'
    },
    ERROR: {
        borderColor: '#00ccff',
        boxShadow: '0 0 30px rgba(0, 204, 255, 0.3), inset 0 0 20px rgba(0, 204, 255, 0.1)',
        background: 'rgba(0, 10, 20, 0.9)',
        color: '#00ccff',
        icon: '📡',
        buttonColor: '#00ccff',
        title: 'System Error'
    }
};

const GameModal = ({ isOpen, onClose, type = 'SUCCESS', message, secondaryMessage }) => {
    const style = modalStyles[type] || modalStyles.ERROR;

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
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 2000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px'
                    }}
                >
                    <motion.div
                        className="game-modal"
                        initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        style={{
                            background: style.background,
                            border: `2px solid ${style.borderColor}`,
                            boxShadow: style.boxShadow,
                            borderRadius: '20px',
                            padding: '30px',
                            maxWidth: '400px',
                            width: '90%',
                            textAlign: 'center',
                            color: '#fff',
                            fontFamily: "'Orbitron', sans-serif"
                        }}
                    >
                        {/* Close Icon (Top Right) */}
                        <div style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', padding: '5px' }} onClick={onClose}>
                            <span style={{ fontSize: '1.5rem', color: style.color }}>×</span>
                        </div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            style={{ fontSize: '50px', marginBottom: '20px' }}
                        >
                            {style.icon}
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                color: style.color,
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', // Responsive font size
                                wordBreak: 'break-word', // Fix alignment issues
                                marginBottom: '15px'
                            }}
                        >
                            {style.title}
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                background: 'rgba(0,0,0,0.5)',
                                padding: '15px',
                                borderRadius: '10px',
                                border: `1px dashed ${style.borderColor}`,
                                margin: '20px 0'
                            }}
                        >
                            <p style={{
                                fontSize: '1.1rem',
                                lineHeight: '1.5',
                                color: '#fff',
                                fontWeight: 'bold',
                                overflowWrap: 'break-word'
                            }}>
                                {message}
                            </p>
                            {secondaryMessage && (
                                <p style={{
                                    color: '#aaa',
                                    fontSize: '0.9rem',
                                    marginTop: '10px',
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    paddingTop: '10px',
                                    overflowWrap: 'break-word'
                                }}>
                                    {secondaryMessage}
                                </p>
                            )}
                        </motion.div>

                        <motion.button
                            onClick={onClose}
                            whileHover={{ scale: 1.05, backgroundColor: style.buttonColor, color: '#000' }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                background: 'transparent',
                                border: `2px solid ${style.buttonColor}`,
                                color: style.buttonColor,
                                padding: '12px 30px',
                                borderRadius: '50px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                letterSpacing: '1px',
                                marginTop: '10px'
                            }}
                        >
                            {type === 'SUCCESS' ? 'CONTINUE MISSION' : 'CLOSE'}
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GameModal;
