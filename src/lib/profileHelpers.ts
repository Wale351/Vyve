import { supabase } from '@/integrations/supabase/client';

// Safe public profile fields - NEVER include wallet_address
export const PUBLIC_PROFILE_FIELDS = 'id, username, avatar_url, bio, verified_creator, created_at';

// Fetch role for a user (separate query since it's in user_roles table)
export async function fetchUserRole(userId: string): Promise<'viewer' | 'streamer' | 'admin'> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .order('role')
    .limit(1)
    .maybeSingle();
  
  return (data?.role as 'viewer' | 'streamer' | 'admin') || 'viewer';
}

// Fetch public profile by ID - uses public_profiles view to respect RLS
export async function fetchPublicProfile(profileId: string) {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username, avatar_url, bio, verified_creator, created_at')
    .eq('id', profileId)
    .maybeSingle();
  
  if (error) throw error;
  if (!data || !data.id) return null;
  
  const role = await fetchUserRole(data.id);
  return { 
    id: data.id,
    username: data.username || 'Unknown',
    avatar_url: data.avatar_url,
    bio: data.bio,
    verified_creator: data.verified_creator || false,
    created_at: data.created_at || new Date().toISOString(),
    role 
  };
}

// Fetch public profile by username (case-insensitive) - uses public_profiles view
export async function fetchPublicProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username, avatar_url, bio, verified_creator, created_at')
    .ilike('username', username)
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  if (!data || !data.id) return null;
  
  const role = await fetchUserRole(data.id);
  return { 
    id: data.id,
    username: data.username || 'Unknown',
    avatar_url: data.avatar_url,
    bio: data.bio,
    verified_creator: data.verified_creator || false,
    created_at: data.created_at || new Date().toISOString(),
    role 
  };
}

// Fetch multiple public profiles by IDs (for batch operations)
// Uses public_profiles view which excludes wallet_address for security
export async function fetchPublicProfiles(profileIds: string[]) {
  if (profileIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username, avatar_url, bio, verified_creator, created_at')
    .in('id', profileIds);
  
  if (error) throw error;
  return (data || []).map(p => ({
    id: p.id!,
    username: p.username,
    avatar_url: p.avatar_url,
    bio: p.bio,
    verified_creator: p.verified_creator,
    created_at: p.created_at,
  }));
}

// Fetch profiles for chat messages (minimal fields) - uses public_profiles view
export async function fetchChatProfiles(senderIds: string[]) {
  if (senderIds.length === 0) return new Map();
  
  const { data } = await supabase
    .from('public_profiles')
    .select('id, username, avatar_url')
    .in('id', senderIds);
  
  return new Map(data?.filter(p => p.id).map(p => [p.id!, { username: p.username || 'Unknown', avatar_url: p.avatar_url }]) || []);
}

// Fetch profiles for streams (includes verified_creator) - uses public_profiles view
export async function fetchStreamProfiles(streamerIds: string[]) {
  if (streamerIds.length === 0) return new Map();
  
  const { data } = await supabase
    .from('public_profiles')
    .select('id, username, avatar_url, bio, verified_creator')
    .in('id', streamerIds);
  
  return new Map(data?.filter(p => p.id).map(p => [p.id!, {
    id: p.id!,
    username: p.username || 'Unknown',
    avatar_url: p.avatar_url,
    bio: p.bio,
    verified_creator: p.verified_creator || false
  }]) || []);
}

// Search profiles by username (case-insensitive partial match)
// Returns username for routing (not UUID) - uses public_profiles view
export async function searchProfiles(query: string, limit = 10) {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username, avatar_url, bio, verified_creator')
    .ilike('username', `%${query}%`)
    .limit(limit);
  
  if (error) throw error;
  
  // Fetch roles for all results
  const profilesWithRoles = await Promise.all(
    (data || []).filter(p => p.id).map(async (profile) => {
      const role = await fetchUserRole(profile.id!);
      return { 
        id: profile.id!,
        username: profile.username || 'Unknown',
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        verified_creator: profile.verified_creator || false,
        role 
      };
    })
  );
  
  return profilesWithRoles;
}

// Get username by user ID (for routing purposes) - uses public_profiles view
export async function getUsername(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle();
  
  if (error || !data) return null;
  return data.username || null;
}
