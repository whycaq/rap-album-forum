/**
 * 模拟数据 - 用于开发和测试
 */

import type { Album, Song } from '@/types/album'

// 模拟专辑数据
export const mockAlbums: Album[] = [
  {
    id: '1',
    title: 'The Marshall Mathers LP',
    artist: 'Eminem',
    coverUrl: 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=Eminem',
    releaseDate: '2000-05-23',
    genre: 'Hip-Hop',
    rating: 4.8,
    ratingCount: 1500,
    songCount: 18,
    previewUrl: 'https://example.com/audio/eminem-preview.mp3'
  },
  {
    id: '2',
    title: 'To Pimp a Butterfly',
    artist: 'Kendrick Lamar',
    coverUrl: 'https://via.placeholder.com/300x300/2a2a2a/ffffff?text=Kendrick',
    releaseDate: '2015-03-15',
    genre: 'Hip-Hop',
    rating: 4.9,
    ratingCount: 2000,
    songCount: 16,
    previewUrl: 'https://example.com/audio/kendrick-preview.mp3'
  },
  {
    id: '3',
    title: 'My Beautiful Dark Twisted Fantasy',
    artist: 'Kanye West',
    coverUrl: 'https://via.placeholder.com/300x300/3a3a3a/ffffff?text=Kanye',
    releaseDate: '2010-11-22',
    genre: 'Hip-Hop',
    rating: 4.7,
    ratingCount: 1800,
    songCount: 13,
    previewUrl: 'https://example.com/audio/kanye-preview.mp3'
  },
  {
    id: '4',
    title: 'Illmatic',
    artist: 'Nas',
    coverUrl: 'https://via.placeholder.com/300x300/4a4a4a/ffffff?text=Nas',
    releaseDate: '1994-04-19',
    genre: 'Hip-Hop',
    rating: 4.9,
    ratingCount: 1200,
    songCount: 10,
    previewUrl: 'https://example.com/audio/nas-preview.mp3'
  },
  {
    id: '5',
    title: 'The Blueprint',
    artist: 'Jay-Z',
    coverUrl: 'https://via.placeholder.com/300x300/5a5a5a/ffffff?text=Jay-Z',
    releaseDate: '2001-09-11',
    genre: 'Hip-Hop',
    rating: 4.6,
    ratingCount: 900,
    songCount: 15,
    previewUrl: 'https://example.com/audio/jayz-preview.mp3'
  },
  {
    id: '6',
    title: 'Good Kid, M.A.A.D City',
    artist: 'Kendrick Lamar',
    coverUrl: 'https://via.placeholder.com/300x300/6a6a6a/ffffff?text=Kendrick2',
    releaseDate: '2012-10-22',
    genre: 'Hip-Hop',
    rating: 4.8,
    ratingCount: 1600,
    songCount: 12,
    previewUrl: 'https://example.com/audio/kendrick2-preview.mp3'
  }
]

// 模拟歌曲数据
export const mockSongs: Record<string, Song[]> = {
  '1': [
    {
      id: '1-1',
      albumId: '1',
      title: 'The Real Slim Shady',
      duration: 284,
      audioUrl: 'https://example.com/audio/eminem1.mp3',
      trackNumber: 1
    },
    {
      id: '1-2',
      albumId: '1',
      title: 'Stan',
      duration: 403,
      audioUrl: 'https://example.com/audio/eminem2.mp3',
      trackNumber: 2
    }
  ],
  '2': [
    {
      id: '2-1',
      albumId: '2',
      title: 'King Kunta',
      duration: 235,
      audioUrl: 'https://example.com/audio/kendrick1.mp3',
      trackNumber: 1
    },
    {
      id: '2-2',
      albumId: '2',
      title: 'Alright',
      duration: 219,
      audioUrl: 'https://example.com/audio/kendrick2.mp3',
      trackNumber: 2
    }
  ],
  '3': [
    {
      id: '3-1',
      albumId: '3',
      title: 'Power',
      duration: 292,
      audioUrl: 'https://example.com/audio/kanye1.mp3',
      trackNumber: 1
    },
    {
      id: '3-2',
      albumId: '3',
      title: 'Runaway',
      duration: 538,
      audioUrl: 'https://example.com/audio/kanye2.mp3',
      trackNumber: 2
    }
  ],
  '4': [
    {
      id: '4-1',
      albumId: '4',
      title: 'N.Y. State of Mind',
      duration: 294,
      audioUrl: 'https://example.com/audio/nas1.mp3',
      trackNumber: 1
    },
    {
      id: '4-2',
      albumId: '4',
      title: 'Life\'s a Bitch',
      duration: 203,
      audioUrl: 'https://example.com/audio/nas2.mp3',
      trackNumber: 2
    }
  ],
  '5': [
    {
      id: '5-1',
      albumId: '5',
      title: 'Izzo (H.O.V.A.)',
      duration: 244,
      audioUrl: 'https://example.com/audio/jayz1.mp3',
      trackNumber: 1
    },
    {
      id: '5-2',
      albumId: '5',
      title: 'Girls, Girls, Girls',
      duration: 284,
      audioUrl: 'https://example.com/audio/jayz2.mp3',
      trackNumber: 2
    }
  ],
  '6': [
    {
      id: '6-1',
      albumId: '6',
      title: 'Bitch, Don\'t Kill My Vibe',
      duration: 342,
      audioUrl: 'https://example.com/audio/kendrick3.mp3',
      trackNumber: 1
    },
    {
      id: '6-2',
      albumId: '6',
      title: 'Swimming Pools (Drank)',
      duration: 312,
      audioUrl: 'https://example.com/audio/kendrick4.mp3',
      trackNumber: 2
    }
  ]
}