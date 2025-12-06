import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSuperAdmin } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        let isMounted = true;

        // Get initial session with timeout
        const getSession = async () => {
            console.log('🔐 AuthContext: Starting getSession...');

            // Set a timeout to ensure we don't hang forever
            const timeoutId = setTimeout(() => {
                console.log('🔐 AuthContext: Timeout reached, proceeding without session');
                if (isMounted) setLoading(false);
            }, 3000);

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                clearTimeout(timeoutId);
                console.log('🔐 AuthContext: Session result:', session ? 'Found' : 'None', sessionError);
                if (session?.user && isMounted) {
                    await loadUserProfile(session.user);
                }
            } catch (err) {
                clearTimeout(timeoutId);
                console.error('🔐 AuthContext: Session error:', err);
            } finally {
                console.log('🔐 AuthContext: Setting loading to false');
                if (isMounted) setLoading(false);
            }
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔐 AuthContext: Auth state changed:', event);
            if (event === 'SIGNED_IN' && session?.user) {
                await loadUserProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Load or create user profile - simplified to avoid hanging
    const loadUserProfile = async (authUser) => {
        console.log('👤 loadUserProfile: Starting for', authUser.email);

        // Create user profile from auth data (no database query to avoid hanging)
        const userProfile = {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email,
            role: isSuperAdmin(authUser.email) ? 'Admin' : 'User',
            avatar: (authUser.user_metadata?.name || authUser.email || 'U').charAt(0).toUpperCase()
        };

        console.log('👤 loadUserProfile: Setting user', userProfile);
        setCurrentUser(userProfile);

        // Try to save/update profile in background (non-blocking)
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert([userProfile], { onConflict: 'id' });

            if (error) {
                console.warn('👤 loadUserProfile: Could not save to DB (non-critical):', error.message);
            } else {
                console.log('👤 loadUserProfile: Profile saved to DB');
            }
        } catch (err) {
            console.warn('👤 loadUserProfile: DB save failed (non-critical):', err.message);
        }
    };

    const login = async (email, password) => {
        setError(null);
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;
            return data.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const register = async (name, email, password) => {
        setError(null);
        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });

            if (authError) throw authError;
            return data.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const loginWithGoogle = async () => {
        setError(null);
        try {
            const { data, error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (authError) throw authError;
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        // Clear local state immediately (so UI updates right away)
        setCurrentUser(null);
        console.log('👋 Logged out locally');

        // Try to sign out from Supabase in background
        try {
            await supabase.auth.signOut();
            console.log('👋 Signed out from Supabase');
        } catch (err) {
            console.warn('⚠️ Supabase signOut failed (non-critical):', err.message);
        }
    };

    const value = {
        currentUser,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
