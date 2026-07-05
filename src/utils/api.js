import { supabase } from './supabase.js';

const AVATAR_COLORS = ['#E84830', '#C8A96E', '#4A90D9', '#7B68EE', '#50C878', '#FF6B6B'];
function colorForId(id) {
  let n = 0;
  for (let i = 0; i < (id || '').length; i++) n += id.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function normalizeEntry(row) {
  const p = row.profiles || {};
  const ageMs = Date.now() - new Date(row.created_at).getTime();
  const mins = Math.floor(ageMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const time = days > 0 ? `${days}d ago` : hrs > 0 ? `${hrs}h ago` : mins > 1 ? `${mins}m ago` : 'Just now';
  return {
    id: row.id,
    user: p.display_name || p.username || 'Unknown',
    avatar: p.avatar_letter || '?',
    avatarColor: p.avatar_color || colorForId(row.user_id),
    userId: row.user_id,
    type: row.type,
    title: row.title,
    year: row.year,
    status: row.status,
    rating: row.rating,
    review: row.review,
    wordSummary: row.word_summary || [],
    genre: row.genre,
    poster: row.type === 'tv' ? '📺' : '🎬',
    posterPath: row.poster_path,
    time,
    likes: Number(row.like_count) || 0,
  };
}

function normalizeProfile(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name || row.username,
    avatar: row.avatar_letter || '?',
    avatarColor: row.avatar_color || colorForId(row.id),
    bio: row.bio || '',
    entryCount: Number(row.entry_count) || 0,
    followerCount: Number(row.follower_count) || 0,
    isFollowing: row.is_following || false,
    lastEntry: row.last_entry_title || null,
    lastEntryType: row.last_entry_type || null,
  };
}

export async function getFeed(userId) {
  const { data, error } = await supabase
    .from('entries')
    .select(`
      *,
      profiles ( username, display_name, avatar_letter, avatar_color ),
      like_count:likes(count)
    `)
    .or(`user_id.eq.${userId},user_id.in.(${await getFollowingIds(userId)})`)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data || []).map(normalizeEntry);
}

export async function getTrending() {
  const { data, error } = await supabase
    .from('entries')
    .select(`
      *,
      profiles ( username, display_name, avatar_letter, avatar_color ),
      like_count:likes(count)
    `)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  const rows = (data || []).map(normalizeEntry);
  rows.sort((a, b) => b.likes - a.likes);
  return rows;
}

export async function getMyEntries(userId) {
  const { data, error } = await supabase
    .from('entries')
    .select(`
      *,
      profiles ( username, display_name, avatar_letter, avatar_color ),
      like_count:likes(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeEntry);
}

export async function getMyLikes(userId) {
  const { data, error } = await supabase
    .from('likes')
    .select('entry_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set((data || []).map(r => r.entry_id));
}

async function getFollowingIds(userId) {
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);
  return (data || []).map(r => r.following_id).join(',') || 'null';
}

export async function getPeople(userId) {
  const { data, error } = await supabase.rpc('get_people', { current_user_id: userId });
  if (error) {
    // Fallback: simple profiles query
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .limit(50);
    return (profiles || []).map(p => ({ ...normalizeProfile(p), isFollowing: false }));
  }
  return (data || []).map(normalizeProfile);
}

export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      from_profile:profiles!notifications_from_user_id_fkey ( username, display_name, avatar_letter, avatar_color ),
      entry:entries ( title )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map(row => {
    const p = row.from_profile || {};
    const ageMs = Date.now() - new Date(row.created_at).getTime();
    const hrs = Math.floor(ageMs / 3600000);
    const days = Math.floor(hrs / 24);
    const time = days > 0 ? `${days}d ago` : hrs > 0 ? `${hrs}h ago` : 'Just now';
    return {
      id: row.id,
      type: row.type,
      read: row.read,
      time,
      user: p.display_name || p.username || 'Someone',
      avatar: p.avatar_letter || '?',
      avatarColor: p.avatar_color || '#E84830',
      entryTitle: row.entry?.title || null,
    };
  });
}

export async function insertEntry(entry, userId) {
  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: userId,
      title: entry.title,
      type: entry.type,
      year: entry.year || null,
      genre: entry.genre || null,
      status: entry.status,
      rating: entry.rating || null,
      review: entry.review || null,
      word_summary: entry.wordSummary?.filter(Boolean) || [],
      poster_path: entry.posterPath || null,
      tmdb_id: entry.tmdbId || null,
    })
    .select(`*, profiles ( username, display_name, avatar_letter, avatar_color ), like_count:likes(count)`)
    .single();
  if (error) throw error;
  return normalizeEntry(data);
}

export async function addLike(entryId, userId) {
  const { error } = await supabase.from('likes').insert({ entry_id: entryId, user_id: userId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function removeLike(entryId, userId) {
  const { error } = await supabase.from('likes').delete().eq('entry_id', entryId).eq('user_id', userId);
  if (error) throw error;
}

export async function addFollow(targetId, currentUserId) {
  const { error } = await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetId });
  if (error && error.code !== '23505') throw error;
  await supabase.from('notifications').insert({ user_id: targetId, from_user_id: currentUserId, type: 'follow' });
}

export async function removeFollow(targetId, currentUserId) {
  const { error } = await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', targetId);
  if (error) throw error;
}

export async function markNotificationRead(id) {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
}

export async function markAllNotificationsRead(userId) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
}
