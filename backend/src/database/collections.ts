import { Collection, Db } from 'mongodb';
import mongo from './mongo';
import { User } from './models/user.model';
import { Place } from './models/place.model';
import { Rating } from './models/rating.model';

export const collections = {
    get users(): Collection<User> { return mongo.db.collection('users'); },
    get places(): Collection<Place> { return mongo.db.collection('places'); },
    get ratings(): Collection<Rating> { return mongo.db.collection('ratings'); }
};
