import React, { createContext, useState, useContext } from 'react';
import { useFlechazo } from './FlechazoContext';
import {
    getPostsByEvent,
    createPost as createPostService,
    deletePost as deletePostService,
    toggleLike as toggleLikeService,
    reportPost as reportPostService,
} from '../services/salseosService';

const SalseosContext = createContext();

export const SalseosProvider = ({ children }) => {
    const { user, hasProfile } = useFlechazo();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = async (eventId) => {
        if (!user?.id || !eventId) {
            setPosts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const result = await getPostsByEvent(eventId, user.id);
        setPosts(result.posts);
        setLoading(false);
    };

    const createPost = async (eventId, body) => {
        if (!user || !eventId) return { success: false, error: 'Debes tener un evento activo' };
        if (!hasProfile) return { success: false, error: 'Completa tu nombre y apellido en Ajustes antes de publicar' };
        if (!body.trim()) return { success: false, error: 'El mensaje no puede estar vacío' };

        const result = await createPostService({ eventId, authorId: user.id, body });
        if (result.success) {
            await loadPosts(eventId);
        }
        return result;
    };

    const deletePost = async (postId, eventId) => {
        const result = await deletePostService(postId);
        if (result.success) {
            await loadPosts(eventId);
        }
        return result;
    };

    // A diferencia de crear/borrar, el like no recarga todo el feed: solo
    // actualiza el post afectado en memoria, para que no parpadee/reordene
    // la lista en una acción tan frecuente.
    const toggleLike = async (postId, eventId) => {
        const post = posts.find((p) => p.id === postId);
        if (!post || !user) return { success: false, error: 'No se encontró el post' };

        const result = await toggleLikeService({
            userId: user.id,
            postId,
            eventId,
            currentlyLiked: post.likedByMe,
        });

        if (result.success) {
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? {
                              ...p,
                              likedByMe: result.likedByMe,
                              likeCount: p.likeCount + (result.likedByMe ? 1 : -1),
                          }
                        : p
                )
            );
        }

        return result;
    };

    // Igual que el like, no recarga el feed: solo marca el post como
    // reportado en memoria (el reporte no se puede retirar).
    const reportPost = async (postId, eventId, reason) => {
        if (!user) return { success: false, error: 'Debes iniciar sesión' };

        const result = await reportPostService({ eventId, postId, reporterId: user.id, reason });

        if (result.success) {
            setPosts((prev) =>
                prev.map((p) => (p.id === postId ? { ...p, reportedByMe: true } : p))
            );
        }

        return result;
    };

    return (
        <SalseosContext.Provider
            value={{
                posts,
                loading,
                loadPosts,
                createPost,
                deletePost,
                toggleLike,
                reportPost,
            }}
        >
            {children}
        </SalseosContext.Provider>
    );
};

export const useSalseos = () => {
    const context = useContext(SalseosContext);
    if (!context) {
        throw new Error('useSalseos must be used within a SalseosProvider');
    }
    return context;
};
