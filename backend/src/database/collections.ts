import mongo from './mongo';
import { User } from './models/user.model';
import { Place } from './models/place.model';
import { Rating } from './models/rating.model';

export const collections = {
    get users() { return mongo.db.collection<User>('users'); },
    get places() { return mongo.db.collection<Place>('places'); },
    get ratings() { return mongo.db.collection<Rating>('ratings'); }
};
