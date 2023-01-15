//import Users from '~/models/users';
import Guilds from '@/models/guilds';

class DatabaseManager {
//  public users = Users;
  public guilds = Guilds;
}

export const database = new DatabaseManager();