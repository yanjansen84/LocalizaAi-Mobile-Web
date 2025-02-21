import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import Navbar from '../components/Navbar';

function Feed() {
  const stories = [
    { id: 1, name: 'Rock SP', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&h=300&fit=crop' },
    { id: 2, name: 'Teatro', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&h=300&fit=crop' },
    { id: 3, name: 'Festival', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&h=300&fit=crop' },
    { id: 4, name: 'Arte', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop' },
  ];

  const posts = [
    {
      id: 1,
      user: {
        name: 'Festival de Música SP',
        avatar: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=50&h=50&fit=crop',
        verified: true
      },
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=600&fit=crop',
      likes: 1234,
      description: 'Prepare-se para a maior festa do ano! 🎉 O Festival de Música SP está chegando com muitas atrações incríveis! #FestivalSP #Música',
      comments: 89,
      time: '2 horas'
    },
    {
      id: 2,
      user: {
        name: 'Teatro Municipal',
        avatar: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=50&h=50&fit=crop',
        verified: true
      },
      image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=600&fit=crop',
      likes: 856,
      description: 'Nova temporada de apresentações começando! 🎭 Não perca os espetáculos mais aguardados do ano. #TeatroSP #Cultura',
      comments: 45,
      time: '5 horas'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Feed</h1>
            <button className="p-2 text-gray-600 dark:text-gray-400">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Stories */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex space-x-4 overflow-x-auto no-scrollbar">
              {stories.map(story => (
                <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full ring-2 ring-purple-600 p-1">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{story.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="pb-16">
            {posts.map(post => (
              <div key={post.id} className="border-b border-gray-200 dark:border-gray-800">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.user.avatar}
                      alt={post.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {post.user.name}
                        </span>
                        {post.user.verified && (
                          <span className="ml-1 text-purple-600">•</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-600 dark:text-gray-400">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Image */}
                <div className="relative">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full object-cover"
                  />
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex justify-between mb-4">
                    <div className="flex space-x-4">
                      <button className="text-gray-600 dark:text-gray-400 hover:text-red-500">
                        <Heart className="w-6 h-6" />
                      </button>
                      <button className="text-gray-600 dark:text-gray-400">
                        <MessageCircle className="w-6 h-6" />
                      </button>
                      <button className="text-gray-600 dark:text-gray-400">
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>
                    <button className="text-gray-600 dark:text-gray-400">
                      <Bookmark className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Likes */}
                  <div className="mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {post.likes.toLocaleString()} curtidas
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white mr-2">
                      {post.user.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {post.description}
                    </span>
                  </div>

                  {/* Comments */}
                  <button className="text-gray-500 text-sm">
                    Ver todos os {post.comments} comentários
                  </button>

                  {/* Time */}
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      Há {post.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navbar */}
        <Navbar />
      </div>
    </div>
  );
}

export default Feed;