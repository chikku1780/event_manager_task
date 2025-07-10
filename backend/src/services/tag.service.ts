import { Tag } from '../types';
import { mockData, getNextCounter } from '../data';

// In-memory storage for tags
class TagService {
  private tags: Map<string, Tag> = new Map();
  private tagCounter = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with mock data from centralized module
    mockData.tags.forEach(tag => {
      this.tags.set(tag.id, tag);
    });
    this.tagCounter = getNextCounter('tags');
  }

  getAllTags(): Tag[] {
    return Array.from(this.tags.values());
  }

  getTagById(id: string): Tag | null {
    return this.tags.get(id) || null;
  }

  getTagsByIds(ids: string[]): Tag[] {
    return ids.map(id => this.tags.get(id)).filter(Boolean) as Tag[];
  }

  createTag(name: string, color?: string): Tag {
    const tag: Tag = {
      id: this.tagCounter.toString(),
      name,
      color: color || this.generateRandomColor()
    };

    this.tags.set(tag.id, tag);
    this.tagCounter++;
    return tag;
  }

  private generateRandomColor(): string {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export const tagService = new TagService(); 