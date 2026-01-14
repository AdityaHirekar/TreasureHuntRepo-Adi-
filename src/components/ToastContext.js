import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.8 }}
                            layout
                            style={{
                                background: 'rgba(0, 0, 0, 0.8)',
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${toast.type === 'error' ? '#ff4444' : toast.type === 'success' ? '#00cc00' : '#00d9ff'}`,
                                color: 'white',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                minWidth: '250px'
                            }}
                        >
                            <span>
                                {toast.type === 'error' && '⚠️'}
                                {toast.type === 'success' && '✅'}
                                {toast.type === 'info' && 'ℹ️'}
                            </span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
