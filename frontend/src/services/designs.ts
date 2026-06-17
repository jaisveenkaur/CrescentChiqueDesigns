import { api } from './api';

export interface DesignImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Design {
  id: string;
  title: string;
  description: string;
  room_type: string;
  style: string;
  price_per_sqft: number;
  image_url: string;
  images?: DesignImage[];
}

export const designService = {
  getDesigns: async (): Promise<Design[]> => {
    try {
      const response = await api.get('/designs');
      // If server returned an array, use it
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.items)) {
        return response.data.items;
      }
      throw new Error('Invalid format');
    } catch (error) {
      console.warn('Designs API unavailable, using premium mock fallback', error);
      return [
        {
          id: 'design-1',
          title: 'Modern Japandi Living Room',
          description: 'A serene mix of Scandinavian simplicity and Japanese rustic minimalism. Featuring natural oak paneling, low-profile seating, textured linen textiles, and organic clay vases.',
          room_type: 'Living Room',
          style: 'Japandi',
          price_per_sqft: 180,
          image_url: '/images/image.png',
          images: [
            { id: 'img-1-1', image_url: '/images/image.png', is_primary: true },
            { id: 'img-1-2', image_url: '/images/image copy.png', is_primary: false }
          ]
        },
        {
          id: 'design-2',
          title: 'Classic Transitional Bedroom',
          description: 'Elegant master bedroom combining traditional details with contemporary comfort. Features a velvet custom headboard, detailed crown moldings, and a sophisticated warm-neutral palette.',
          room_type: 'Bedroom',
          style: 'Transitional',
          price_per_sqft: 150,
          image_url: '/images/image copy.png',
          images: [
            { id: 'img-2-1', image_url: '/images/image copy.png', is_primary: true },
            { id: 'img-2-2', image_url: '/images/image copy 2.png', is_primary: false }
          ]
        },
        {
          id: 'design-3',
          title: 'Sleek Luxury Modular Kitchen',
          description: 'High-gloss lacquer cabinetry, integrated gold-veined marble slab countertops, custom gold fixtures, and state-of-the-art fully integrated smart appliances.',
          room_type: 'Kitchen',
          style: 'Modern Luxury',
          price_per_sqft: 220,
          image_url: '/images/image copy 2.png',
          images: [
            { id: 'img-3-1', image_url: '/images/image copy 2.png', is_primary: true },
            { id: 'img-3-2', image_url: '/images/image copy 3.png', is_primary: false }
          ]
        },
        {
          id: 'design-4',
          title: 'Sophisticated Executive Home Office',
          description: 'Designed for focus. Features walnut-clad bookshelves, ergonomic brass detailing, minimalist seating, and warm, diffused task lighting.',
          room_type: 'Office',
          style: 'Contemporary',
          price_per_sqft: 140,
          image_url: '/images/image copy 3.png',
          images: [
            { id: 'img-4-1', image_url: '/images/image copy 3.png', is_primary: true }
          ]
        },
        {
          id: 'design-5',
          title: 'Luxury Commercial Lobby & Lounge',
          description: 'Premium welcome lounge with custom fluted marble columns, velvet lounge chairs, warm ambient architectural accent bars, and a dramatic fireplace backdrop.',
          room_type: 'Commercial',
          style: 'Art Deco',
          price_per_sqft: 250,
          image_url: '/images/image copy 4.png',
          images: [
            { id: 'img-5-1', image_url: '/images/image copy 4.png', is_primary: true }
          ]
        }
      ] as Design[];
    }
  },

  getDesignDetails: async (id: string): Promise<Design> => {
    try {
      const response = await api.get(`/designs/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Design Details API for ${id} failed, using details fallback`);
      const designs = await designService.getDesigns();
      return designs.find(d => d.id === id) || designs[0];
    }
  }
};
