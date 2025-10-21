/**
 * Spotify API集成 - 获取真实的专辑封面和音乐数据
 */

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ''

let accessToken: string | null = null
let tokenExpiry: number = 0

/**
 * 获取Spotify访问令牌
 */
async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error('Failed to get Spotify access token')
    }

    const data = await response.json()
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 提前1分钟过期
    
    return accessToken
  } catch (error) {
    console.error('Error getting Spotify token:', error)
    throw error
  }
}

/**
 * 搜索专辑
 */
export async function searchAlbums(query: string, limit: number = 10) {
  try {
    const token = await getAccessToken()
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to search albums')
    }

    const data = await response.json()
    return data.albums.items.map((album: any) => ({
      id: album.id,
      title: album.name,
      artist: album.artists.map((artist: any) => artist.name).join(', '),
      coverUrl: album.images[0]?.url || '',
      releaseDate: album.release_date,
      genre: album.genres?.[0] || '',
      totalTracks: album.total_tracks
    }))
  } catch (error) {
    console.error('Error searching albums:', error)
    throw error
  }
}

/**
 * 获取专辑详情
 */
export async function getAlbumDetails(albumId: string) {
  try {
    const token = await getAccessToken()
    
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to get album details')
    }

    const album = await response.json()
    
    return {
      id: album.id,
      title: album.name,
      artist: album.artists.map((artist: any) => artist.name).join(', '),
      coverUrl: album.images[0]?.url || '',
      releaseDate: album.release_date,
      genre: album.genres?.[0] || '',
      totalTracks: album.total_tracks,
      songs: album.tracks.items.map((track: any) => ({
        id: track.id,
        title: track.name,
        duration: Math.floor(track.duration_ms / 1000),
        trackNumber: track.track_number,
        previewUrl: track.preview_url || ''
      }))
    }
  } catch (error) {
    console.error('Error getting album details:', error)
    throw error
  }
}

/**
 * 获取艺人热门专辑
 */
export async function getArtistAlbums(artistId: string, limit: number = 10) {
  try {
    const token = await getAccessToken()
    
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?limit=${limit}&include_groups=album,single`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to get artist albums')
    }

    const data = await response.json()
    return data.items.map((album: any) => ({
      id: album.id,
      title: album.name,
      artist: album.artists.map((artist: any) => artist.name).join(', '),
      coverUrl: album.images[0]?.url || '',
      releaseDate: album.release_date,
      totalTracks: album.total_tracks
    }))
  } catch (error) {
    console.error('Error getting artist albums:', error)
    throw error
  }
}