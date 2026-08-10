import React, { createContext, useState, useContext } from 'react';
import { useFlechazo } from './FlechazoContext';
import {
    getPostsByEvent,
    createPost as createPostService,
    deletePost as deletePostService,
    toggleLike as toggleLikeService,
    reportPost as reportPostService,
    createReply as createReplyService,
} from '../services/salseosService';

const SalseosContext = createContext();

export const SalseosProvider = ({ children }) => {
    const { user, hasProfile, salseoUsername } = useFlechazo();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadedEventId, setLoadedEventId] = useState(null);

    // Si ya tenemos los posts de este evento cargados, no repetimos la
    // petición solo por volver a entrar a la sección — hay que pasar
    // { force: true } explícitamente (recargar, o tras crear/borrar).
    const loadPosts = async (eventId, { force = false } = {}) => {
        if (!user?.id || !eventId) {
            setPosts([]);
            setLoadedEventId(null);
            setLoading(false);
            return;
        }

        if (!force && loadedEventId === eventId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const result = await getPostsByEvent(eventId, user.id);
        setPosts(result.posts);
        setLoadedEventId(eventId);
        setLoading(false);
    };

    const createPost = async (eventId, body) => {
        if (!user || !eventId) return { success: false, error: 'Debes tener un evento activo' };
        if (!hasProfile) return { success: false, error: 'Completa tu nombre y apellido en Ajustes antes de publicar' };
        if (!salseoUsername) return { success: false, error: 'Elige antes tu usuario de Salseo' };
        if (!body.trim()) return { success: false, error: 'El mensaje no puede estar vacío' };

        const result = await createPostService({ eventId, authorId: user.id, body });
        if (result.success) {
            await loadPosts(eventId, { force: true });
        }
        return result;
    };

    const deletePost = async (postId, eventId) => {
        const result = await deletePostService(postId);
        if (result.success) {
            await loadPosts(eventId, { force: true });
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

    // Responder desde el feed no navega al detalle: solo sube el contador de
    // respuestas en memoria (el cuerpo de la respuesta solo se ve al entrar
    // al mensaje concreto).
    const replyFromFeed = async (postId, eventId, body) => {
        if (!user) return { success: false, error: 'Debes iniciar sesión' };
        if (!hasProfile) return { success: false, error: 'Completa tu nombre y apellido en Ajustes antes de responder' };
        if (!salseoUsername) return { success: false, error: 'Elige antes tu usuario de Salseo' };
        if (!body.trim()) return { success: false, error: 'La respuesta no puede estar vacía' };

        const result = await createReplyService({ postId, eventId, authorId: user.id, body });

        if (result.success) {
            setPosts((prev) =>
                prev.map((p) => (p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p))
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
                replyFromFeed,
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
