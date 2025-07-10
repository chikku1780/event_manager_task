import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, CreateUserInput, LoginInput, UserRole } from '../types';
import { mockData, getNextCounter } from '../data';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory storage for users
class UserService {
  private users: Map<string, User> = new Map();
  private userCounter = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with mock data from centralized module
    mockData.users.forEach(user => {
      this.users.set(user.id, user);
    });
    this.userCounter = getNextCounter('users');
  }

  async createUser(input: CreateUserInput): Promise<User> {
    // Check if email already exists
    const existingUser = this.findUserByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(input.password, 10);

    const user: User = {
      id: this.userCounter.toString(),
      name: input.name,
      email: input.email,
      passwordHash,
      role: UserRole.USER,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    this.users.set(user.id, user);
    this.userCounter++;
    return user;
  }

  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const user = this.findUserByEmail(input.email);
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token };
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  findUserByEmail(email: string): User | null {
    return Array.from(this.users.values()).find(user => user.email === email) || null;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUserRole(userId: string, role: UserRole): User | null {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      role,
      updatedAt: new Date().toISOString()
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  verifyToken(token: string): { userId: string; email: string; role: UserRole } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      return null;
    }
  }

  getEventManagers(): User[] {
    return Array.from(this.users.values()).filter(user => 
      user.role === UserRole.EVENT_MANAGER && user.isActive
    );
  }
}

export const userService = new UserService(); 