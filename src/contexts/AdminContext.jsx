import React, { createContext, useState, useEffect, useContext } from 'react';
import { useFlechazo } from './FlechazoContext';
import { checkIsAdmin } from '../services/adminService';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const { user, loading: flechazoLoading } = useFlechazo();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Esperar a que FlechazoContext resuelva la sesión antes de decidir
        // "no admin" — si no, en una carga en frío se evalúa con user=null.
        if (flechazoLoading) return;

        if (user?.id) {
            setLoading(true);
            checkIsAdmin(user.id).then((result) => {
                setIsAdmin(result.isAdmin);
                setLoading(false);
            });
        } else {
            setIsAdmin(false);
            setLoading(false);
        }
    }, [user?.id, flechazoLoading]);

    return (
        <AdminContext.Provider value={{ isAdmin, loading }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
